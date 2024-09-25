import {CONTEXTS} from './resources/contexts/contexts.js'
import {logv2} from "./utils.js";
import {CONTEXTS as CONTEXTS_ATHUMI} from "./resources/contexts/athumi/contexts.js";

export const createDocumentLoaderOptionsDefault = {
    logging: {
        loadedContextNames: false,
        urls: {
            present:false, // Log URLs present in contexts
            missing: true}, // Log URLs not present in contexts
        documents: false // Log resolved document
    }
}

export const createDocumentLoader = (contexts, options) => {
    if (options===undefined)
        options = createDocumentLoaderOptionsDefault
    if(contexts === undefined)
        throw new Error('Provided contexts is undefined')

    if(options.logging.loadedContextNames)
        console.log('Loaded contexts: ', Object.keys(contexts))

    return async (url) => {
        if (url in contexts) {
            if(options.logging.urls.present)
                console.log(`URL: ${url}`)
            if(options.logging.documents)
                logv2(contexts[url], `📄Document:`)


            return {
                contextUrl: undefined, // this is for a context via a link header
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                document: contexts[url], // this is the actual document that was loaded
                documentUrl: url, // this is the actual context URL after redirects
            }
        } else {
            if(options.logging.urls.missing)
                console.log(`⚠️Missing URL: ${url}`)
        }

        // return empty document if `url` is not in local contexts
        return {
            contextUrl: undefined,
            documentUrl: url,
            document: {},
        }
    }
}

export function getAthumiContexts() {
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

    const addedContexts = {
        "https://w3id.org/security/multikey/v1": CONTEXTS["https://w3id.org/security/multikey/v1"],
        "https://www.w3.org/ns/did/v1": CONTEXTS["https://www.w3.org/ns/did/v1"],
        "https://zkp-ld.org/context.jsonld": CONTEXTS["https://zkp-ld.org/context.jsonld"]
    }

    const updatedContexts = {
        ...filteredContextsAthumi,
        ...addedContexts
    }

    return updatedContexts;
}

export const documentLoader = createDocumentLoader(CONTEXTS)
export const documentLoaderAthumi = createDocumentLoader(getAthumiContexts())
export const documentLoaderAll = createDocumentLoader({
    ...getAthumiContexts(),
    ...CONTEXTS
})
