import {Deriver} from "../../src/controllers/deriver.js";
import {_frame, logv2, readJsonFile} from "../../src/utils.js";
import config, {urlDerive} from "../../src/config/config.js"
import {RegistryWebserviceProxy} from "../../src/proxies/RegistryWebserviceProxy.js";
import {actors} from "../actors.js";
// Global variables
const registry = new RegistryWebserviceProxy(
    config.registry.baseUrl,
    config.registry.port
)
const deriver = new Deriver(registry)
const issuer = actors.issuer0;
const unsignedDiplomaCredential = readJsonFile('__tests__/__fixtures__/vc/vc1.json')
const unsignedIdentityCredential = readJsonFile('__tests__/__fixtures__/vc/vc2.json')
const challenge = 'abc123'
/**
 * [Helper] Structural tests for a VP resulting from /derive
 * @param vp
 */
const checkVP = (vp) => {
    // vp
    expect(vp.proof).toHaveProperty('type')
    expect(vp.proof).toHaveProperty('proofValue')
    // vc
    const {verifiableCredential} = vp
    expect(verifiableCredential.proof).toHaveProperty('type')
    expect(verifiableCredential.proof).toHaveProperty('verificationMethod')
}

beforeEach(async () => {
    // Register (context: Issuer)
    console.log('clearing registry')
    await registry.clearRegistry()
    console.log(`registering: ${issuer.id}`)
    await registry.register(issuer.id, issuer)
})

test('register - sign - resolve - verify ', async () => {
    // Sign (context: Issuer)
    const vc = await deriver.sign(unsignedIdentityCredential, [issuer])
    // Verify (context: Verifier)
    // Resolve the issuer's public key material from the registry
    const resolvedKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verify(vc, [resolvedKeypair])
    expect(verificationResult.verified).toBe(true)
})

test('register - sign - derive (RQ) - resolve - verify ', async () => {
    // Sign (context: Issuer)
    const vc = await deriver.sign(unsignedIdentityCredential, [issuer])
    // Derive (context: Holder)
    const deriveResponse = await fetch(
        urlDerive,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vcPairs: [
                    {
                        original: vc,
                        disclosed: readJsonFile('__tests__/__fixtures__/range-query/disclosed2.json'),
                    }
                ],
                predicates: [
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
                                    '@value': '9999',
                                    '@type': 'xsd:integer',
                                },
                            },
                        ],
                    },
                    {
                        '@context': 'https://zkp-ld.org/context.jsonld',
                        type: 'Predicate',
                        circuit: 'circ:lessThanPrvPub',
                        private: [
                            {
                                type: 'PrivateVariable',
                                var: 'lesser',
                                val: '_:Y',
                            },
                        ],
                        public: [
                            {
                                type: 'PublicVariable',
                                var: 'greater',
                                val: {
                                    '@value': '50000',
                                    '@type': 'xsd:integer',
                                },
                            },
                        ],
                    },
                ],
                challenge
            })
        }
    )
    expect(deriveResponse.ok).toBe(true)
    // Derived result is a VP
    const vp = await deriveResponse.json()
    checkVP(vp)
    // Verify (context: Verifier)
    // Resolve the issuer's public key material from the registry
    const publicKeypair = await registry.resolve(vc.issuer)
    const verificationResult = await deriver.verifyProof(vp, [publicKeypair], challenge)
    expect(verificationResult.verified).toBe(true)
})

test('register - sign - derive (SD) - resolve - verify ', async () => {
    // Sign (context: Issuer)
    const vc = await deriver.sign(unsignedIdentityCredential, [issuer])
    // Derive (context: Holder)
    const disclosedDoc = await _frame(
        vc,
        readJsonFile('__tests__/__fixtures__/selective-disclosure/vc2-sd-001c.json')
    )
    const deriveResponse = await fetch(
        urlDerive,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vcPairs: [
                    {
                        original: vc,
                        disclosed: disclosedDoc,
                    }
                ],
                challenge
            })
        }
    )
    expect(deriveResponse.ok).toBe(true)
    // Derived result is a VP
    const vp = await deriveResponse.json()
    checkVP(vp)
    // Verify (context: Verifier)
    // Resolve the issuer's public key material from the registry
    const publicKeypair = await registry.resolve(vc.issuer)
    const verificationResult = await deriver.verifyProof(vp, [publicKeypair], challenge)
    expect(verificationResult.verified).toBe(true)
})

test('register - sign - derive (RQ) - resolve - verify ', async () => {
    // Sign (context: Issuer)
    const vc = await deriver.sign(unsignedIdentityCredential, [issuer])
    // Derive (context: Holder)
    const disclosedDoc = readJsonFile('__tests__/__fixtures__/range-query/disclosed2.json')
    const deriveResponse = await fetch(
        urlDerive,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vcPairs: [{original: vc, disclosed: disclosedDoc}],
                predicates: [
                    {
                        '@context': 'https://zkp-ld.org/context.jsonld',
                        type: 'Predicate',
                        circuit: 'circ:lessThanPrvPub',
                        private: [
                            {
                                type: 'PrivateVariable',
                                var: 'lesser',
                                val: '_:Y',
                            },
                        ],
                        public: [
                            {
                                type: 'PublicVariable',
                                var: 'greater',
                                val: {
                                    '@value': '50000',
                                    '@type': 'xsd:integer',
                                },
                            },
                        ],
                    },
                ],
                challenge
            })
        }
    )
    expect(deriveResponse.ok).toBe(true)
    // Derived result is a VP
    const vp = await deriveResponse.json()
    checkVP(vp)
    // Verify (context: Verifier)
    // Resolve the issuer's public key material from the registry
    const publicKeypair = await registry.resolve(vc.issuer)
    const verificationResult = await deriver.verifyProof(vp, [publicKeypair], challenge)
    expect(verificationResult.verified).toBe(true)
})

test('register - sign - derive (RQ) - resolve - verify [SHOULD NOT VERIFY]', async () => {
    // Sign (context: Issuer)
    const vc = await deriver.sign(unsignedIdentityCredential, [issuer])
    // Derive (context: Holder)
    const disclosedDoc = readJsonFile('__tests__/__fixtures__/range-query/disclosed2.json')
    const deriveResponse = await fetch(
        urlDerive,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vcPairs: [{original: vc, disclosed: disclosedDoc}],
                predicates: [
                    {
                        '@context': 'https://zkp-ld.org/context.jsonld',
                        type: 'Predicate',
                        circuit: 'circ:lessThanPrvPub',
                        private: [
                            {
                                type: 'PrivateVariable',
                                var: 'lesser',
                                val: '_:Y',
                            },
                        ],
                        public: [
                            {
                                type: 'PublicVariable',
                                var: 'greater',
                                val: {
                                    '@value': '5',
                                    '@type': 'xsd:integer',
                                },
                            },
                        ],
                    },
                ],
                challenge
            })
        }
    )
    expect(deriveResponse.ok).toBe(true)
    // Derived result is a VP
    const vp = await deriveResponse.json()
    checkVP(vp)
    // Verify (context: Verifier)
    // Resolve the issuer's public key material from the registry
    const publicKeypair = await registry.resolve(vc.issuer)
    const verificationResult = await deriver.verifyProof(vp, [publicKeypair], challenge)
    expect(verificationResult.verified).toBe(false)
})

/**
 * TODO: fix
 */
test.skip('register - sign - derive (SD(VC_ID)+RQ(VC_D)) - resolve - verify ', async () => {
    // Sign (context: Issuer)
    const vcId = await deriver.sign(unsignedIdentityCredential, [issuer])
    const vcD = await deriver.sign(unsignedDiplomaCredential, [issuer])

    // Derive (context: Holder)
    // Disclosure document for VC Identity
    const disclosedDocVcId = await _frame(
        unsignedIdentityCredential, readJsonFile('__tests__/__fixtures__/selective-disclosure/vc1-sd-001b.json')
    )
    // Disclosure document for VC Diploma
    const disclosedDocVcD = readJsonFile('__tests__/__fixtures__/range-query/vc1-rq-001a.json')

    const body = {
        vcPairs: [
            {original: vcId, disclosed: disclosedDocVcId},
            {original: vcD, disclosed: disclosedDocVcD},
        ],
        predicates: [
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
                            '@value': '3',
                            '@type': 'xsd:integer',
                        },
                    },
                ],
            },
        ],
        challenge
    }
    logv2({body})
    const deriveResponse = await fetch(
        urlDerive,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }
    )

    expect(deriveResponse.ok).toBe(true)

    // Derived result is a VP
    const vp = await deriveResponse.json()
    checkVP(vp)

    // Verify (context: Verifier)
    // Resolve the issuer's public key material from the registry
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(vp, [publicKeypair], challenge)


    expect(verificationResult.verified).toBe(true)
})
