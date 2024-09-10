import {
    BbsBlsSignature2020
} from "@mattrglobal/jsonld-signatures-bbs";
import { verify, purposes } from "jsonld-signatures";

import config from './config.json';

import { documentLoader, cli } from './util';

import fsp from 'fs/promises';
import path from 'path';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const verifyDiploma = async (credentialConfig: any): Promise<void> => {
    const signedDocument = JSON.parse(await fsp.readFile(path.resolve(__dirname, credentialConfig.path_refresh_signed), 'utf8'));
    //Verify the proof
    let verified = await verify(signedDocument, {
        suite: new BbsBlsSignature2020(),
        purpose: new purposes.AssertionProofPurpose(),
        documentLoader,
    });

    if (verified.verified) {
        console.log(`'${credentialConfig.description}' verified!`);
    } else {
        throw new Error(`Couldn't verify ${credentialConfig.description}`);
    }
    await fsp.writeFile(path.resolve(__dirname, credentialConfig.path_original_verified), JSON.stringify(verified, null, 2));
};

cli(config, verifyDiploma);
