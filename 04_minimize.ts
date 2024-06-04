import {
    BbsBlsSignatureProof2020,
    deriveProof,
} from "@mattrglobal/jsonld-signatures-bbs";

import revealDocument from "./data/frame/frame_leercredential_diplomaniveau.json"; // configuration file for selectively disclosing parts of the VC into a VP

import config from './config.json';

import { documentLoader, cli } from './util';

import fsp from 'fs/promises';
import path from 'path';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const minimizeDiploma = async (credentialConfig: any): Promise<void> => {
    const signedDocument = JSON.parse(await fsp.readFile(path.resolve(__dirname, credentialConfig.path_refresh_signed), 'utf8'));
    //STEP 4
    //Derive a proof
    const derivedDocument = await deriveProof(signedDocument, revealDocument, {
        suite: new BbsBlsSignatureProof2020(),
        documentLoader,
    });

    console.log("Derivation result");
    // console.log(JSON.stringify(derivedProof, null, 2));
    await fsp.writeFile(path.resolve(__dirname, credentialConfig.path_derived), JSON.stringify(derivedDocument, null, 2));
};

cli(config, minimizeDiploma);
