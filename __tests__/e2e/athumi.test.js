import {RegistryWebserviceProxy} from "../../src/proxies/RegistryWebserviceProxy.js";
import config from "../../src/config/config.js"
import {actors} from "../actors.js";
import {Deriver} from "../../src/controllers/deriver.js";
import {checkVP, executeDeriveRequest, loadVcResources, preprocessContext, preprocessVC} from "../helpers.js";
import {documentLoaderAll} from "../../src/documentloader.js";
import {
  _frame,
  athumiSpecificPreprocessing, getNestedAttribute,
  logv2,
  matchVariableAssignments,
  readJsonFile,
  setNestedAttribute
} from "../../src/utils.js";

// Global variables
const registry = new RegistryWebserviceProxy(
  config.registry.baseUrl,
  config.registry.port
)
const dl = documentLoaderAll
const deriver = new Deriver(registry, dl)
const issuer = actors.issuer0;
const vcDir = '__tests__/__fixtures__/vc/athumi'
const vcResourceRecords = loadVcResources(vcDir)
const challenge = 'abc123'

beforeEach(async () => {
  // Register (context: Issuer)
  await registry.clearRegistry()
  await registry.register(issuer.id, issuer)
})


describe('E2E: Athumi', ()=>{
  vcResourceRecords
    .forEach(vrr => {
      test(`Derive (RQ(Toekenningsproces.toekenningsdatum > 2000-01-01)) - Verify: ${vrr.fname}`,async ()=> {
        /**
         * The original Athumi VCs' proofs are signed using the Ed25519 cryptosuite.
         * However, this cryptosuite does not support ZKP SD + RQ.
         * Therefore, we preprocess the original VCs and (re)sign them using cryptosuite
         * `bbs-termwise-signature-2023`.
         */
        const signedVc = await deriver.sign(preprocessVC(vrr.vc),[issuer])

        /**
         * RQ Preprocessing.
         */
        // 1. The original JLD Frame is being applied on the signed VC
        const oldFrame = readJsonFile('__tests__/__fixtures__/range-query/athumi/frame-rq-toekenningsdatum.json')
        let newFrame = await _frame(signedVc, preprocessContext(oldFrame), dl)

        // ?. TODO: briefly explain the Athumi specific preprocessing steps
        // const preprocessedSignedVc = await athumiSpecificPreprocessing(signedVc)

        // ?. Find & Match variable assignments
        const matchedVariableAssignments = matchVariableAssignments(oldFrame)
        expect(matchedVariableAssignments.length).toBe(1)

        // ?. Process matched var assignments
        const [ma,] = matchedVariableAssignments
        const updatePath = ma.pathElements.slice(0, -1)
        setNestedAttribute(newFrame, updatePath, getNestedAttribute(oldFrame, updatePath))

        // ?. TODO: step description
        const predicates = [
          {
            '@context': 'https://zkp-ld.org/context.jsonld',
            type: 'Predicate',
            circuit: 'circ:lessThanPubPrv',
            private: [
              {
                type: 'PrivateVariable',
                var: 'greater',
                val: '_:Y',
              },
            ],
            public: [
              {
                type: 'PublicVariable',
                var: 'lesser',
                val: {
                  '@value': '2000-01-01T00:00:00.000Z',
                  '@type': 'xsd:dateTime',
                },
              },
            ],
          },
        ]

        /**
         * Execute RQ
         */
        const deriveResponse = await executeDeriveRequest(
          [{original: signedVc, disclosed: newFrame, predicates }],
          predicates,
          challenge
        )
        expect(deriveResponse.ok).toBe(true)

        // Derived result is a VP
        const vp = await deriveResponse.json()
        checkVP(vp)

        /**
         * Verify (context: Verifier)
         */
        // Public keys need to be obtained first (see https://github.com/zkp-ld/jsonld-proofs/issues/14)
        const pubKeys = await deriver.resolvePublicKeysForVP(vp)
        // Resolve the issuer's public key material from the registry
        const verificationResult = await deriver.verifyProof(vp, pubKeys, challenge)
        expect(verificationResult.verified).toBe(true)

      })
    })

})
