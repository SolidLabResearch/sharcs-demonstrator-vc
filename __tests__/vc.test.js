import fs from 'fs';
import path from 'path';
import {_frame, clone, readJsonFile} from "../src/utils.js";
import jsonld from "jsonld";
import {createDocumentLoader, createDocumentLoaderOptionsDefault, getAthumiContexts} from "../src/documentloader.js";
import {Deriver} from "../src/controllers/deriver.js";
import {RegistryMockProxy} from "../src/proxies/RegistryMockProxy.js";
import {actors} from "./actors.js";

/**
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

describe('VC tests: athumi',  () => {
    const vcDir = '__tests__/__fixtures__/vc/athumi'
    const vcResourceRecords = loadVcResources(vcDir)
    const dirTemp = path.resolve('./temp')
    const outputTestResults = true

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
        updated = preprocessVcProof(updated)
        return updated
    }

    function getDocumentLoader() {
        let dlOptions = clone(createDocumentLoaderOptionsDefault)
        dlOptions.logging.loadedContextNames = false
        dlOptions.logging.urls.missing = true
        dlOptions.logging.urls.present = false
        dlOptions.logging.documents = false
        return createDocumentLoader(getAthumiContexts(), dlOptions)
    }

    function getDeriverInstance() {
        const mockKeypairs = []
        return new Deriver(new RegistryMockProxy(mockKeypairs), dl)
    }

    setupTestEnvironment()
    const dl = getDocumentLoader()
    const deriver = getDeriverInstance()

    const issuer = actors.issuer0; // TODO: update issuer (currently, example issuer is used)

    vcResourceRecords.forEach(vrr => {
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

        test(`TEST03 VC (${vrr.fname}): sign - verify - SD`, async ()=>{
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
            const derived = await deriver.sd(
                [{original: signedVc, disclosed: newFrame}],
                challenge
            )

            if(outputTestResults)
                fs.writeFileSync(
                    path.resolve(dirTemp, `TEST03_derived-result_${vrr.fname.replace('.json','')}.json`),
                    JSON.stringify(derived, null, 2))
        })
    })
})
