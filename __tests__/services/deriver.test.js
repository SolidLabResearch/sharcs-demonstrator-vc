import {_frame, readJsonFile} from "../../src/utils.js";
import {Deriver} from "../../src/controllers/deriver.js";
import keypairsPublic from '../../src/resources/keypairs-public.json' with {type: 'json'};

import {RegistryMockProxy} from "../../src/proxies/RegistryMockProxy.js";
/**
 * TODO: Choose another issuer for VC1
 * TODO: Test contents of derived credentials (assert that credentials only contain the attributes described in the disclosure doc)!
 * TODO: Reduce redundant code by extracting common code to functions
 */

// Global variables
const registry = new RegistryMockProxy(keypairsPublic)
const actors = {
    issuer0: {
        "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://www.w3.org/ns/data-integrity/v1",
            "https://w3id.org/security/multikey/v1"
        ],
        "id": "did:example:issuer0",
        "verificationMethod": {
            "id": "did:example:issuer0#bls12_381-g2-pub001",
            "type": "Multikey",
            "controller": "did:example:issuer0",
            "secretKeyMultibase": "uekl-7abY7R84yTJEJ6JRqYohXxPZPDoTinJ7XCcBkmk",
            "publicKeyMultibase": "ukiiQxfsSfV0E2QyBlnHTK2MThnd7_-Fyf6u76BUd24uxoDF4UjnXtxUo8b82iuPZBOa8BXd1NpE20x3Rfde9udcd8P8nPVLr80Xh6WLgI9SYR6piNzbHhEVIfgd_Vo9P"
        }
    }
}
const issuer = actors.issuer0;
const deriver = new Deriver(registry)
const challenge = 'abc123'

test('vc1-rq-001a: One predicates (l < x). Proof should verify.', async () => {
    const unsignedDiplomaCredential = readJsonFile('__tests__/__fixtures__/vc/vc1.json')
    const vc = await deriver.sign(unsignedDiplomaCredential, [issuer])
    const disclosedDoc = readJsonFile('__tests__/__fixtures__/range-query/vc1-rq-001a.json')
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
                        '@value': '2',
                        '@type': 'xsd:integer',
                    },
                },
            ],
        },
    ]
    const challenge = 'abc123'
    const vcPairs = [{original: vc, disclosed: disclosedDoc}]
    const result = await deriver.rq(vcPairs, predicates, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
})

test('vc1-rq-001b: One predicates (l < x). Proof should verify.', async () => {
    const unsignedDiplomaCredential = readJsonFile('__tests__/__fixtures__/vc/vc1.json')
    const vc = await deriver.sign(unsignedDiplomaCredential, [issuer])
    const disclosedDoc = readJsonFile('__tests__/__fixtures__/range-query/vc1-rq-001b.json')
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
    const challenge = 'abc123'
    const vcPairs = [{original: vc, disclosed: disclosedDoc}]
    const result = await deriver.rq(vcPairs, predicates, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
})

test('vc1-rq-001b: One predicates (l < x). Proof should NOT verify.', async () => {
    const unsignedDiplomaCredential = readJsonFile('__tests__/__fixtures__/vc/vc1.json')
    const vc = await deriver.sign(unsignedDiplomaCredential, [issuer])
    const disclosedDoc = readJsonFile('__tests__/__fixtures__/range-query/vc1-rq-001b.json')
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
    const challenge = 'abc123'
    const vcPairs = [{original: vc, disclosed: disclosedDoc}]
    const result = await deriver.rq(vcPairs, predicates, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(false);
})

test('vc2-rq-001: One predicate (l < x). Proof SHOULD verify.', async () => {
    // Unsigned credential
    const vcDraft = readJsonFile('__tests__/__fixtures__/vc/vc2.json')
    // Sign
    const vc = await deriver.sign(vcDraft, [issuer])
    // Derive (SD)
    const disclosedDoc = readJsonFile('__tests__/__fixtures__/range-query/disclosed2.json')
    const predicates = [
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
    ]
    const vcPairs = [{original: vc, disclosed: disclosedDoc}]
    const result = await deriver.rq(vcPairs, predicates, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
})

test('vc2-rq-002a: Two predicates (l < x < r). Proof SHOULD verify.', async () => {
    // Unsigned credential
    const vcDraft = readJsonFile('__tests__/__fixtures__/vc/vc2.json')
    // Sign
    const vc = await deriver.sign(vcDraft, [issuer])
    // Derive (SD)
    const disclosedDoc = readJsonFile('__tests__/__fixtures__/range-query/disclosed2.json',)
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
    ]
    const vcPairs = [{original: vc, disclosed: disclosedDoc}]
    const result = await deriver.rq(vcPairs, predicates, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
})

test('vc2-rq-002b: Two predicates (l < x < r). Proof should NOT verify.', async () => {
    const vcDraft = readJsonFile('__tests__/__fixtures__/vc/vc2.json')
    const vc = await deriver.sign(vcDraft, [issuer])
    const disclosedDoc = readJsonFile('__tests__/__fixtures__/range-query/disclosed2.json')
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
                        '@value': '10001',
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
    ]
    const challenge = 'abc123'
    const vcPairs = [{original: vc, disclosed: disclosedDoc}]
    const result = await deriver.rq(vcPairs, predicates, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(false);
})

test('vc3-rq-001a: Two predicates (l < x < r). Proof SHOULD verify.', async () => {
    // Unsigned credential
    const vcDraft = readJsonFile('__tests__/__fixtures__/vc/vc3.json')
    // Sign
    const vc = await deriver.sign(vcDraft, [issuer])
    // Derive (SD)
    const disclosedDoc = readJsonFile('__tests__/__fixtures__/range-query/vc3-rq-001a.json')
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
                        '@value': '1500',
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
                        '@value': '2500',
                        '@type': 'xsd:integer',
                    },
                },
            ],
        },
    ]
    const vcPairs = [{original: vc, disclosed: disclosedDoc}]
    const result = await deriver.rq(vcPairs, predicates, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
})

test('vc1-sd-001a', async () => {
    // Unsigned credential
    const vcDraft = readJsonFile('__tests__/__fixtures__/vc/vc1.json')
    // Sign
    const vc = await deriver.sign(vcDraft, [issuer])
    // Derive (SD)
    const frame = readJsonFile('__tests__/__fixtures__/selective-disclosure/vc1-sd-001a.json')
    const disclosedDoc = await _frame(vc, frame)
    const vcPairs = [{original: vc, disclosed: disclosedDoc}]
    const result = await deriver.sd(vcPairs, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
})

test('vc1-sd-001b', async () => {
    // Unsigned credential
    const vcDraft = readJsonFile('__tests__/__fixtures__/vc/vc1.json')
    // Sign
    const vc = await deriver.sign(vcDraft, [issuer])
    // Derive (SD)
    const frame = readJsonFile('__tests__/__fixtures__/selective-disclosure/vc1-sd-001b.json')
    const disclosedDoc = await _frame(vc, frame)
    const vcPairs = [{original: vc, disclosed: disclosedDoc}]
    const result = await deriver.sd(vcPairs, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
})

test('vc1-sd-001c', async () => {
    // Unsigned credential
    const vcDraft = readJsonFile('__tests__/__fixtures__/vc/vc1.json')
    // Sign
    const vc = await deriver.sign(vcDraft, [issuer])
    // Derive (SD)
    const frame = readJsonFile('__tests__/__fixtures__/selective-disclosure/vc1-sd-001c.json')
    const disclosedDoc = await _frame(vc, frame)
    const vcPairs = [{original: vc, disclosed: disclosedDoc}]
    const result = await deriver.sd(vcPairs, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
})

test('vc2-sd-001a', async () => {
    // Unsigned credential
    const vcDraft = readJsonFile('__tests__/__fixtures__/vc/vc2.json')
    // Sign
    const vc = await deriver.sign(vcDraft, [issuer])
    // Derive (SD)
    const frame = readJsonFile('__tests__/__fixtures__/selective-disclosure/vc2-sd-001a.json')
    const disclosedDoc = await _frame(vcDraft, frame)
    const vcPairs = [{original: vc, disclosed: disclosedDoc}]
    const result = await deriver.sd(vcPairs, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
})

test('vc2-sd-001b', async () => {
    // Unsigned credential
    const vcDraft = readJsonFile('__tests__/__fixtures__/vc/vc2.json')
    // Sign
    const vc = await deriver.sign(vcDraft, [issuer])
    // Derive (SD)
    const frame = readJsonFile('__tests__/__fixtures__/selective-disclosure/vc2-sd-001b.json')
    const disclosedDoc = await _frame(vcDraft, frame)
    const vcPairs = [{original: vc, disclosed: disclosedDoc}]
    const result = await deriver.sd(vcPairs, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
})

test('vc2-sd-001c', async () => {
    // Unsigned credential
    const vcDraft = readJsonFile('__tests__/__fixtures__/vc/vc2.json')
    // Sign
    const vc = await deriver.sign(vcDraft, [issuer])
    // Derive (SD)
    const frame = readJsonFile('__tests__/__fixtures__/selective-disclosure/vc2-sd-001c.json')
    const disclosedDoc = await _frame(vcDraft, frame)
    const vcPairs = [{original: vc, disclosed: disclosedDoc}]
    const result = await deriver.sd(vcPairs, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
})

test('Combined: vc2-sd-001a and vc2-sd-001b', async () => {
    // Unsigned credential
    const vcDraft = readJsonFile('__tests__/__fixtures__/vc/vc2.json')
    // Sign
    const vc = await deriver.sign(vcDraft, [issuer])
    // Derive (SD)
    const frame1 = readJsonFile('__tests__/__fixtures__/selective-disclosure/vc2-sd-001a.json')
    const frame2 = readJsonFile('__tests__/__fixtures__/selective-disclosure/vc2-sd-001b.json')
    const vcPairs = [
        {original: vc, disclosed: await _frame(vcDraft, frame1)},
        {original: vc, disclosed: await _frame(vcDraft, frame2)}
    ]
    const result = await deriver.sd(vcPairs, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
})

test('Combined: vc1-sd-001b and vc2-sd-001b', async () => {
    // Sign
    const vc1 = await deriver.sign(readJsonFile('__tests__/__fixtures__/vc/vc1.json'), [issuer])
    const vc2 = await deriver.sign(readJsonFile('__tests__/__fixtures__/vc/vc2.json'), [issuer])
    // Derive (SD)
    const frame1 = readJsonFile('__tests__/__fixtures__/selective-disclosure/vc1-sd-001b.json')
    const frame2 = readJsonFile('__tests__/__fixtures__/selective-disclosure/vc2-sd-001b.json')
    const vcPairs = [
        {original: vc1, disclosed: await _frame(vc1, frame1)},
        {original: vc2, disclosed: await _frame(vc2, frame2)}
    ]
    const result = await deriver.sd(vcPairs, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
})

test('Combined SD + RQ: vc1-sd-001b & vc2-rq-001', async () => {
    // Sign
    const vc1 = await deriver.sign(readJsonFile('__tests__/__fixtures__/vc/vc1.json'), [issuer])
    const vc2 = await deriver.sign(readJsonFile('__tests__/__fixtures__/vc/vc2.json'), [issuer])
    // Derive (SD)
    const vcPairs = [
        {
            original: vc1,
            disclosed: await _frame(vc1, readJsonFile('__tests__/__fixtures__/selective-disclosure/vc1-sd-001b.json'))
        },
        {
            original: vc2,
            disclosed: readJsonFile('__tests__/__fixtures__/range-query/disclosed2.json'),
        }
    ]
    const predicates = [
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
    ]
    const result = await deriver.rq(vcPairs, predicates, challenge)
    // Verify
    const publicKeypair = await registry.resolve(issuer.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
})
