import {CONTEXTS} from './resources/contexts/contexts.js'

export const documentLoader = async (url) => {
    if (url in CONTEXTS) {
      return {
        contextUrl: undefined, // this is for a context via a link header
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        document: CONTEXTS[url], // this is the actual document that was loaded
        documentUrl: url, // this is the actual context URL after redirects
      }
    }
  
    // return empty document if `url` is not in local contexts
    return {
      contextUrl: undefined,
      documentUrl: url,
      document: {},
    }
  }
