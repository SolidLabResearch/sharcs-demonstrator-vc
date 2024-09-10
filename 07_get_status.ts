import {
    Bls12381G2KeyPair,
    BbsBlsSignature2020
} from "@mattrglobal/jsonld-signatures-bbs";
import { sign, purposes } from "jsonld-signatures";

import keyPairOptions from "./data/keyPair.json"; // keypair needed to create original VC

import fsp from 'fs/promises';
import path from 'path';

import { Bitstring } from '@digitalbazaar/bitstring';

import { documentLoader } from "./util";

import config from './config.json';

/**
 * Formats an input date to w3c standard date format
 * @param date {number|string} Optional if not defined current date is returned
 *
 * @returns {string} date in a standard format as a string
 */
const w3cDate = (date?: number | string): string => {
    let result = new Date();
    if (typeof date === "number" || typeof date === "string") {
        result = new Date(date);
    }
    const str = result.toISOString();
    return str.substr(0, str.length - 5) + "Z";
};

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

    const bitstring = new Bitstring({ length: 131072 });
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
    const db = config.status;
    const vp = await createStatusVP(db);
    await fsp.writeFile(path.resolve(__dirname, './data/output/status.json'), JSON.stringify(vp, null, 2));
}

main();
