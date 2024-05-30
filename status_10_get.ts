import {
    Bls12381G2KeyPair,
    BbsBlsSignature2020
} from "@mattrglobal/jsonld-signatures-bbs";
import { extendContextLoader, sign, purposes } from "jsonld-signatures";

import keyPairOptions from "./data/keyPair.json"; // keypair needed to create original VC
import issuerDoc from "./data/issuer.json";
import keyPairPublic from "./data/keyPair_public.json"; // public key needed to verify VCs

import bbsContext from "./data/context/bbs.json";
import credentialContext from "./data/context/credentials.json";
import credential2Context from './data/context/credentials2.json';
import credential2ExampleContext from './data/context/credentials2example.json';
import suiteContext from "./data/context/suite.json";

import fsp from 'fs/promises';

import {Bitstring} from '@digitalbazaar/bitstring';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const documents: any = {
    "did:example:magda_mock": issuerDoc,
    "did:example:magda_mock#keypair": keyPairPublic,
    "https://w3id.org/security/bbs/v1": bbsContext,
    "https://www.w3.org/2018/credentials/v1": credentialContext,
    "https://w3id.org/security/suites/jws-2020/v1": suiteContext, // it's not clear where this context comes from
    "https://www.w3.org/ns/credentials/v2": credential2Context,
    'https://www.w3.org/ns/credentials/examples/v2': credential2ExampleContext,
};


/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const customDocLoader = (url: string): any => {
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
const documentLoader = extendContextLoader(customDocLoader);

async function createStatusVP(db: any): Promise<any> {
    const result: any = {
        "@context": [
            "https://www.w3.org/ns/credentials/v2",
            "https://www.w3.org/ns/credentials/examples/v2"
        ],
        "id": "https://example.com/credentials/status/3",
        "type": ["VerifiableCredential", "BitstringStatusListCredential"],
        "issuer": "did:example:magda_mock",
        "validFrom": w3cDate(),
        "credentialSubject": {
            "id": "https://example.com/credentials/status/3#list",
            "type": "BitstringStatusList",
            "statusPurpose": "revocation",
            "encodedList": ""
        }
    };

    const bitstring = new Bitstring({length: 131072});
    for (const id of Object.keys(db)) {
        if (db[id].revoked) {
            bitstring.set(db[id].index, true);
        }
    }
    result.credentialSubject.encodedList = await bitstring.encodeBits();

    const keyPair = await new Bls12381G2KeyPair(keyPairOptions);
    const signedResultDocument = await sign(result, {
        suite: new BbsBlsSignature2020({ key: keyPair }),
        purpose: new purposes.AssertionProofPurpose(),
        documentLoader,
    });

    return signedResultDocument;
}

const main = async (): Promise<void> => {
    const db = JSON.parse(await fsp.readFile('./data/status_db.json', 'utf8'));
    const vp = await createStatusVP(db);
    console.log(JSON.stringify(vp, null, 2));
}

main();

/**
 * Formats an input date to w3c standard date format
 * @param date {number|string} Optional if not defined current date is returned
 *
 * @returns {string} date in a standard format as a string
 */
export const w3cDate = (date?: number | string): string => {
    let result = new Date();
    if (typeof date === "number" || typeof date === "string") {
        result = new Date(date);
    }
    const str = result.toISOString();
    return str.substr(0, str.length - 5) + "Z";
};
