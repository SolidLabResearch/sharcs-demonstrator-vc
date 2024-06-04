import { extendContextLoader } from "jsonld-signatures";

import issuerDoc from "./data/issuer.json";
import keyPairPublic from "./data/keyPair_public.json"; // public key needed to verify VCs

import bbsContext from "./data/context/bbs.json";
import credentialContext from "./data/context/credentials.json";
import credential2Context from "./data/context/credentials2.json";
import suiteContext from "./data/context/suite.json";

import leercredentialContext from "./data/context/leercredential-ap.json";
import leercredentialskosContext from "./data/context/skos-ap.json";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const documents: any = {
    "did:example:magda_mock": issuerDoc,
    "did:example:magda_mock#keypair": keyPairPublic,
    "https://w3id.org/security/bbs/v1": bbsContext,
    "https://www.w3.org/2018/credentials/v1": credentialContext,
    "https://www.w3.org/ns/credentials/v2": credential2Context,
    "https://www.w3.org/ns/credentials/examples/v2": {},
    "https://w3id.org/security/suites/jws-2020/v1": suiteContext, // it's not clear where this context comes from
    "https://solid.data.vlaanderen.be/doc/implementatiemodel/leercredential/2023-02-01/context/leercredential-ap.jsonld": leercredentialContext,
    "https://solid.data.vlaanderen.be/doc/implementatiemodel/skos/2023-02-01/context/skos-ap.jsonld": leercredentialskosContext,
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const customDocLoader = (url: string): any => {
    const context = documents[url];

    if (context) {
        return {
            contextUrl: null, // this is for a context via a link header
            document: context, // this is the actual document that was loaded
            documentUrl: url, // this is the actual context URL after redirects
        };
    }

    console.log(`Attempted to remote load context : '${url}', please cache instead`);
    throw new Error(`Attempted to remote load context : '${url}', please cache instead`);
};

//Extended document load that uses local contexts
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const documentLoader: any = extendContextLoader(customDocLoader);

export async function cli(config: any, fn: any): Promise<void> {
    console.log(`Usage: script.js [index of credential in config.json, doing all by default]`);
    if (process.argv[2]) {
        fn(config.original_credentials[process.argv[2]])
    } else {
        for (let index = 0; index < config.original_credentials.length; index++) {
            const element = config.original_credentials[index];
            await fn(element);
        }
    }
}
