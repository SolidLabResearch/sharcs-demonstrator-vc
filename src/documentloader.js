import {CONTEXTS} from './resources/contexts/contexts.js'

export const createDocumentLoaderOptionsDefault = {
    logging: {
        loadedContextNames: false,
        urls: {
            present:false, // Log URLs present in contexts
            missing: false}, // Log URLs not present in contexts
        documents: false // Log resolved document
    }}
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
                console.log(`📄Document:`, contexts[url])

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

export const documentLoader = createDocumentLoader(CONTEXTS)
