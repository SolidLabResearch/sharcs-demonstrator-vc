import fs from 'fs';
import path from 'path';
import {
  _frame,
  athumiSpecificPreprocessing,
  getNestedAttribute,
  matchVariableAssignments,
  readJsonFile,
  setNestedAttribute
} from "../src/utils.js";
import jsonld from "jsonld";
import {documentLoaderAll} from "../src/documentloader.js";
import {Deriver} from "../src/controllers/deriver.js";
import {RegistryMockProxy} from "../src/proxies/RegistryMockProxy.js";
import {actors} from "./actors.js";
import keypairsPublic from "../src/resources/keypairs-public.json";
import {loadVcResources, preprocessContext, preprocessVC} from "./helpers.js";

const outputTestResults = false // TODO: refactor

/**
 * TODO: Refactor
 */
function setupTestEnvironment() {
  if (outputTestResults) {
    fs.mkdir(dirTemp,
      {recursive: true},
      (err) => {
        if (err) {
          return console.error(err);
        }
        console.log('Directory created successfully!');
      });
  }
}

describe('VC tests: athumi', () => {

  const vcDir = '__tests__/__fixtures__/vc/athumi'
  const vcResourceRecords = loadVcResources(vcDir)
  const dirTemp = path.resolve('./temp') // TODO: refactor





  function getDeriverInstance() {
    const registry = new RegistryMockProxy(keypairsPublic)
    return new Deriver(registry, dl)
  }



  setupTestEnvironment()
  const dl = documentLoaderAll
  const deriver = getDeriverInstance()
  const issuer = actors.issuer0; // TODO: update issuer (currently, example issuer is used)

  vcResourceRecords
    .forEach(vrr => {
      test(`TEST00 VC (${vrr.fname}): expand`, async () => {
        const vc = preprocessVC(vrr.vc)
        // Try to expand without errors
        jsonld.expand(vc, {documentLoader: dl})
      })

      test(`TEST01 VC (${vrr.fname}): sign`, async () => {
        const vc = preprocessVC(vrr.vc)
        const signedVc = await deriver.sign(vc, [issuer])
        expect(signedVc.proof.cryptosuite).toEqual('bbs-termwise-signature-2023')
        if (outputTestResults)
          fs.writeFileSync(
            path.resolve(dirTemp, `TEST01_signed-vc${vrr.fname.replace('.json', '')}.json`),
            JSON.stringify(signedVc, null, 2))
      })

      test(`TEST02 VC (${vrr.fname}): sign - verify`, async () => {
        const vc = preprocessVC(vrr.vc)
        const signedVc = await deriver.sign(vc, [issuer])
        const verificationResult = await deriver.verify(signedVc, [issuer])
        expect(verificationResult.verified).toBe(true)
      })

      test(`TEST03 VC (${vrr.fname}): sign - verify - SD - verify`, async () => {
        const vc = preprocessVC(vrr.vc)
        const signedVc = await deriver.sign(vc, [issuer])

        const verificationResult = await deriver.verify(signedVc, [issuer])

        expect(verificationResult.verified).toBe(true)

        ////////////////////////////////////////////////
        // Selective Disclosure
        ////////////////////////////////////////////////

        // Frame
        const oldFrame = readJsonFile('__tests__/__fixtures__/selective-disclosure/athumi/frame_leercredential_diplomaniveau-v2.json')
        let newFrame = oldFrame
        newFrame = preprocessContext(oldFrame)
        newFrame = await _frame(signedVc, newFrame, dl)

        // SD
        const challenge = 'abc123'
        const sdResult = await deriver.sd(
          [{original: signedVc, disclosed: newFrame}],
          challenge
        )

        // Verify
        const sdVerificationResult = await deriver.verifyProof(sdResult, [issuer], challenge)
        expect(sdVerificationResult.verified).toBe(true)
      })

      test(`TEST04 VC (${vrr.fname}): sign - verify - RQ - verify`, async () => {
        const vc = preprocessVC(vrr.vc)
        const signedVc = await deriver.sign(vc, [issuer])
        const verificationResult = await deriver.verify(signedVc, [issuer])
        const challenge = 'abc123'
        expect(verificationResult.verified).toBe(true)

        ////////////////////////////////////////////////
        // RQ / PREPROCESSING
        ////////////////////////////////////////////////
        const oldFrame = readJsonFile('__tests__/__fixtures__/range-query/athumi/frame-rq-toekenningsdatum.json')
        let newFrame = oldFrame
        newFrame = preprocessContext(oldFrame)
        newFrame = await _frame(signedVc, newFrame, dl)

        const preprocessedSignedVc = await athumiSpecificPreprocessing(signedVc)

        const matchedVariableAssignments = matchVariableAssignments(oldFrame)

        expect(matchedVariableAssignments.length).toBe(1)

        // Process matched var assignments
        const [ma,] = matchedVariableAssignments
        const updatePath = ma.pathElements.slice(0, -1)
        setNestedAttribute(newFrame, updatePath, getNestedAttribute(oldFrame, updatePath))

        ////////////////////////////////////////////////
        // RQ Computation
        ////////////////////////////////////////////////
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

        const rqResult = await deriver.rq([
          {original: preprocessedSignedVc, disclosed: newFrame}
        ], predicates, challenge)

        const rqVerificationResult = await deriver.verifyProof(rqResult, [issuer], challenge)
        expect(rqVerificationResult.verified).toBe(true)
      })

      test(`TEST04b VC (${vrr.fname}): sign - verify - RQ - verify [SHOULD NOT VERIFY]`, async () => {
        const vc = preprocessVC(vrr.vc)
        const signedVc = await deriver.sign(vc, [issuer])
        const verificationResult = await deriver.verify(signedVc, [issuer])
        const challenge = 'abc123'
        expect(verificationResult.verified).toBe(true)

        ////////////////////////////////////////////////
        // RQ / PREPROCESSING
        ////////////////////////////////////////////////
        const oldFrame = readJsonFile('__tests__/__fixtures__/range-query/athumi/frame-rq-toekenningsdatum.json')
        let newFrame = oldFrame
        newFrame = preprocessContext(oldFrame)
        newFrame = await _frame(signedVc, newFrame, dl)

        const preprocessedSignedVc = await athumiSpecificPreprocessing(signedVc)


        const matchedVariableAssignments = matchVariableAssignments(oldFrame)

        expect(matchedVariableAssignments.length).toBe(1)

        // Process matched var assignments
        const [ma,] = matchedVariableAssignments
        const updatePath = ma.pathElements.slice(0, -1)
        setNestedAttribute(newFrame, updatePath, getNestedAttribute(oldFrame, updatePath))

        ////////////////////////////////////////////////
        // RQ Computation
        ////////////////////////////////////////////////
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
                  '@value': '2024-01-01T00:00:00.000Z',
                  '@type': 'xsd:dateTime',
                },
              },
            ],
          },
        ]

        const rqResult = await deriver.rq([
          {original: preprocessedSignedVc, disclosed: newFrame}
        ], predicates, challenge)

        const rqVerificationResult = await deriver.verifyProof(rqResult, [issuer], challenge)
        expect(rqVerificationResult.verified).toBe(false)
      })
    })
})
