import fs from 'fs';
import path from 'path';
import {
    _frame,
    clone,
    extractElementsBetweenBrackets,
    getNestedAttribute,
    logv2,
    readJsonFile,
    setNestedAttribute, writeJsonFile
} from "../src/utils.js";
import jsonld from "jsonld";
import {
    createDocumentLoader,
    createDocumentLoaderOptionsDefault,
    documentLoaderAll,
    getAthumiContexts
} from "../src/documentloader.js";
import {Deriver} from "../src/controllers/deriver.js";
import {RegistryMockProxy} from "../src/proxies/RegistryMockProxy.js";
import {actors} from "./actors.js";
import walkJson from 'json-tree-walker';
import keypairsPublic from "../src/resources/keypairs-public.json";
import {CONTEXTS_ATHUMI} from "../src/resources/contexts/index.js";
import {CONTEXTS, DATA_INTEGRITY_CONTEXT} from "../src/resources/contexts/contexts.js";

const outputTestResults= false // TODO: refactor
/**
 * TODO: Refactor
 * [HELPER]
 * Loads VC resources from given directory.
 * @param directory
 * @returns {{data: *, fpath: string | *}[]}
 */
function loadVcResources(directory) {
    return fs.readdirSync(directory)
        // TODO: filter (only keep .json or .jsonld files)
        .map(f => {
            const fpath = path.join(directory, f)

            return { fpath,  vc: readJsonFile(fpath), fname: path.basename(fpath) }
        })
}

/**
 * TODO: Refactor
 */
function setupTestEnvironment() {
    if(outputTestResults) {
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

describe('VC tests: athumi',  () => {
    const vcDir = '__tests__/__fixtures__/vc/athumi'
    const vcResourceRecords = loadVcResources(vcDir)
    const dirTemp = path.resolve('./temp') // TODO: refactor

    function preprocessContext(old) {
        let updated = clone(old)
        updated['@context'] = [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/ns/data-integrity/v1",
            "https://solid.data.vlaanderen.be/doc/implementatiemodel/leercredential/2023-02-01/context/leercredential-ap.jsonld",
            "https://solid.data.vlaanderen.be/doc/implementatiemodel/skos/2023-02-01/context/skos-ap.jsonld"
        ]
        return updated
    }

    function preprocessMetadata(old) {
        let updated = clone(old)
        updated['issuer'] = 'did:example:issuer0'
        return updated
    }

    function preprocessVcProof(old) {
        let updated = clone(old)
        // TODO: the updated proof's verificationMethod contains fixed reference to issuer
        updated['proof'] = {
            "type": "DataIntegrityProof",
            "cryptosuite": "bbs-termwise-signature-2023",
            "proofPurpose": "assertionMethod",
            "verificationMethod": "did:example:issuer0#bls12_381-g2-pub001",
            "@context": "https://www.w3.org/ns/data-integrity/v1"
        }
        return updated
    }

    function preprocessVC(old) {
        let updated = clone(old)
        updated = preprocessContext(updated)
        updated = preprocessMetadata(updated)
        updated = preprocessVcProof(updated)
        return updated
    }

    /**
     * Expands the given document and subsequently compacts it using the Athumi & Data Integrity contexts.
     * @param doc
     * @returns {Promise<*>}
     */
    const athumiSpecificPreprocessing = async (doc) => {
        const options = {documentLoader: documentLoaderAll}
        // 1. Expand (expands every shorthand by its IRI)
        doc = await jsonld.expand(doc, options)
        // 2. Compact using VC & Athumi contexts
        const _ctx = {
            ...CONTEXTS_ATHUMI["https://www.w3.org/2018/credentials/v1"]['@context'],
            ...CONTEXTS[DATA_INTEGRITY_CONTEXT]['@context']
        }
        doc = await jsonld.compact(doc, _ctx, options)

        return doc;
    }

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
        test(`TEST00 VC (${vrr.fname}): expand`, async ()=>{
            const vc = preprocessVC(vrr.vc)
            // Try to expand without errors
            jsonld.expand(vc, {documentLoader: dl})
        })

        test(`TEST01 VC (${vrr.fname}): sign`, async ()=>{
            const vc = preprocessVC(vrr.vc)
            const signedVc = await deriver.sign(vc, [issuer])
            expect(signedVc.proof.cryptosuite).toEqual('bbs-termwise-signature-2023')
            if(outputTestResults)
                fs.writeFileSync(
                    path.resolve(dirTemp, `TEST01_signed-vc${vrr.fname.replace('.json','')}.json`),
                    JSON.stringify(signedVc, null, 2))
        })

        test(`TEST02 VC (${vrr.fname}): sign - verify`, async ()=>{
            const vc = preprocessVC(vrr.vc)
            const signedVc = await deriver.sign(vc, [issuer])
            const verificationResult = await deriver.verify(signedVc, [issuer])
            expect(verificationResult.verified).toBe(true)
        })

        test(`TEST03 VC (${vrr.fname}): sign - verify - SD - verify`, async ()=>{
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

        test(`TEST04 VC (${vrr.fname}): sign - verify - RQ - verify`, async ()=>{
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

            const nestedStrings = [];
            const matchedVariableAssignments = []
            walkJson.json(oldFrame,{
                // 'undefined' handles nulls
                undefined: (key, value, parentType, metaData) => nullKeys.push([key, metaData]),
                object: (key, _value, _parentType, metaData) => walkJson.concatPathMeta(key, metaData),
                array: (key, _value, _parentType, metaData) => walkJson.concatPathMeta(key, metaData),
                number: (key, value, parentType, metaData) => walkJson.concatPathMeta(key, metaData),
                boolean: (key, value, parentType, metaData) => walkJson.concatPathMeta(key, metaData),
                string: (key, value, _parentType, metaData) => {
                    const finalPath = walkJson.concatPathMeta(key, metaData);
                    nestedStrings.push(`${finalPath}: ${value}`);
                    // Detect variable assignments (_:X, _:Y, and _:Z)
                    if(value.toString().match('_:[X|Y|Z]'))
                        matchedVariableAssignments.push({
                            key,
                            value,
                            parentPath: metaData,
                            finalPath,
                            pathElements: extractElementsBetweenBrackets(finalPath)})
                }
            })

            expect(matchedVariableAssignments.length).toBe(1)

            // Process matched var assignments
            const [ma,] = matchedVariableAssignments
            const updatePath = ma.pathElements.slice(0,-1)
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
                { original: preprocessedSignedVc, disclosed: newFrame}
            ], predicates, challenge)

            const rqVerificationResult = await deriver.verifyProof(rqResult, [issuer], challenge)
            expect(rqVerificationResult.verified).toBe(true)
        })

        test(`TEST04b VC (${vrr.fname}): sign - verify - RQ - verify [SHOULD NOT VERIFY]`, async ()=>{
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

                const nestedStrings = [];
                const matchedVariableAssignments = []
                walkJson.json(oldFrame,{
                    // 'undefined' handles nulls
                    undefined: (key, value, parentType, metaData) => nullKeys.push([key, metaData]),
                    object: (key, _value, _parentType, metaData) => walkJson.concatPathMeta(key, metaData),
                    array: (key, _value, _parentType, metaData) => walkJson.concatPathMeta(key, metaData),
                    number: (key, value, parentType, metaData) => walkJson.concatPathMeta(key, metaData),
                    boolean: (key, value, parentType, metaData) => walkJson.concatPathMeta(key, metaData),
                    string: (key, value, _parentType, metaData) => {
                        const finalPath = walkJson.concatPathMeta(key, metaData);
                        nestedStrings.push(`${finalPath}: ${value}`);
                        // Detect variable assignments (_:X, _:Y, and _:Z)
                        if(value.toString().match('_:[X|Y|Z]'))
                            matchedVariableAssignments.push({
                                key,
                                value,
                                parentPath: metaData,
                                finalPath,
                                pathElements: extractElementsBetweenBrackets(finalPath)})
                    }
                })

                expect(matchedVariableAssignments.length).toBe(1)

                // Process matched var assignments
                const [ma,] = matchedVariableAssignments
                const updatePath = ma.pathElements.slice(0,-1)
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
                    { original: preprocessedSignedVc, disclosed: newFrame}
                ], predicates, challenge)

                const rqVerificationResult = await deriver.verifyProof(rqResult, [issuer], challenge)
                expect(rqVerificationResult.verified).toBe(false)
            })
    })
})
