import fs from 'fs';
import path from 'path';
import {logv2, readJsonFile} from "../src/utils.js";
import jsonld from "jsonld";

import {CONTEXTS as CONTEXTS_ATHUMI} from "../src/resources/contexts/athumi/contexts.js";
import {createDocumentLoader, createDocumentLoaderOptionsDefault} from "../src/documentloader.js";
import {Deriver} from "../src/controllers/deriver.js";
import {RegistryMockProxy} from "../src/proxies/RegistryMockProxy.js";
import {actors} from "./actors.js";
import {CONTEXTS} from "../src/resources/contexts/contexts.js";

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


describe.skip('VC tests: samples',  () => {
    test('001', async () => {})
})

describe.skip('VC tests: athumi',  () => {
    const vcDir = '__tests__/__fixtures__/vc/athumi'
    const vcResourceRecords = loadVcResources(vcDir)

    let dlOptions = JSON.parse(JSON.stringify(createDocumentLoaderOptionsDefault))
    dlOptions.logging.loadedContextNames = true
    dlOptions.logging.urls.missing = true
    dlOptions.logging.urls.present = true
    dlOptions.logging.documents = true
    const dl = createDocumentLoader(CONTEXTS_ATHUMI, dlOptions)

    const mockKeypairs =[
        {
            "id": "did:example:magda_mock#keypair",
            "controller": "did:example:magda_mock",
            "publicKeyBase58": "oqpWYKaZD9M1Kbe94BVXpr8WTdFBNZyKv48cziTiQUeuhm7sBhCABMyYG4kcMrseC68YTFFgyhiNeBKjzdKk9MiRWuLv5H4FFujQsQK2KTAtzU8qTBiZqBHMmnLF4PL7Ytu"
        }
    ]

    const vrrIndex = 0;
    const vrr = vcResourceRecords[vrrIndex];
    const {fname, vc} = vrr
    console.log({vrrIndex, fname})

    test('VC [TODO: ID]: expand', async () => {
        // expand
        const expandedVc = await jsonld.expand(vc, {documentLoader: dl})
    })

    test.only('VC [TODO: ID]: verify', async () => {
        const deriver = new Deriver(new RegistryMockProxy(mockKeypairs), dl)
        const verificationResult = await deriver.verify(vc, mockKeypairs)
    })

    test('VC [TODO: ID]: expand - verify', async () => {
        // expand
        const expandedVc = await jsonld.expand(vc, {documentLoader: dl})

        // verify
        const deriver = new Deriver(new RegistryMockProxy(mockKeypairs), dl)
        const verificationResult = await deriver.verify(expandedVc, mockKeypairs)
    })
})

describe('VC tests: athumi (updated)',  () => {
    const vcDir = '__tests__/__fixtures__/vc/athumi'
    const vcResourceRecords = loadVcResources(vcDir)

    let dlOptions = JSON.parse(JSON.stringify(createDocumentLoaderOptionsDefault))
    dlOptions.logging.loadedContextNames = true
    dlOptions.logging.urls.missing = true
    dlOptions.logging.urls.present = true
    dlOptions.logging.documents = false

    const contextsToExclude = [
        "https://w3id.org/security/bbs/v1",
        "https://www.w3.org/ns/credentials/v2",
        "https://www.w3.org/ns/credentials/examples/v2",
        "https://w3id.org/security/suites/jws-2020/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1",
        "https://w3id.org/vc-revocation-list-2020/v1"
    ]

    const filteredContextsAthumi = Object.fromEntries(
        Object.entries(CONTEXTS_ATHUMI)
            .filter(([k,v])=>!contextsToExclude.includes(k))
    )

    console.log(`
    Nr. of athumi contexts: ${Object.keys(CONTEXTS_ATHUMI).length}
    Nr. of filtered athumi contexts: ${Object.keys(filteredContextsAthumi).length}
    `)

    // TODO: add "https://w3id.org/security/multikey/v1"
    const addedContexts = {
        "https://w3id.org/security/multikey/v1": CONTEXTS["https://w3id.org/security/multikey/v1"],
        "https://www.w3.org/ns/did/v1": CONTEXTS["https://www.w3.org/ns/did/v1"]
    }
    const updatedContexts = {
        ...filteredContextsAthumi,
        ...addedContexts
    }
    const dl = createDocumentLoader(updatedContexts, dlOptions)

    const mockKeypairs =[
        {
            "id": "did:example:magda_mock#keypair",
            "controller": "did:example:magda_mock",
            "publicKeyBase58": "oqpWYKaZD9M1Kbe94BVXpr8WTdFBNZyKv48cziTiQUeuhm7sBhCABMyYG4kcMrseC68YTFFgyhiNeBKjzdKk9MiRWuLv5H4FFujQsQK2KTAtzU8qTBiZqBHMmnLF4PL7Ytu"
        }
    ]

    const vrrIndex = 0;
    const vrr = vcResourceRecords[vrrIndex];



    function clone(obj) {
        return JSON.parse(JSON.stringify(obj))
    }
    function preprocessVC(old) {
        let updated = clone(old)
        updated['@context'] = [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/ns/data-integrity/v1",
            "https://solid.data.vlaanderen.be/doc/implementatiemodel/leercredential/2023-02-01/context/leercredential-ap.jsonld",
            "https://solid.data.vlaanderen.be/doc/implementatiemodel/skos/2023-02-01/context/skos-ap.jsonld"
        ]
        // updated['proof'] = {
        //     '@context': [
        //         "https://www.w3.org/ns/data-integrity/v1"
        //     ]
        // }

        updated['proof'] = {
            "type": "DataIntegrityProof",
                "created": "2023-01-01T00:00:00Z",
                "cryptosuite": "bbs-termwise-signature-2023",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:example:issuer0#bls12_381-g2-pub001",
                "@context": "https://www.w3.org/ns/data-integrity/v1"
        }

        return updated
    }

    async function sign(vc) {

    }


    test('VC [TODO: ID]: expand', async () => {
        const vc = preprocessVC(vrr.vc)
        const expanded = jsonld.expand(vc, {documentLoader: dl})
    })

    test('VC [TODO: ID]: sign', async () => {
        const vc = preprocessVC(vrr.vc)
        const deriver = new Deriver(new RegistryMockProxy(mockKeypairs), dl)

        const issuer = actors.issuer0;
        const signedVc = await deriver.sign(vc, [issuer])
        logv2(signedVc)

    })


})
