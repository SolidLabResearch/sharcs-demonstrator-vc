import {
    Bls12381G2KeyPair,
    BbsBlsSignature2020
} from "@mattrglobal/jsonld-signatures-bbs";
import { sign, purposes } from "jsonld-signatures";

const config = require('./config');

import {documentLoader, cli} from './util';

import keyPairOptions from "./data/keyPair.json"; // keypair needed to create original VC
import fsp from 'fs/promises';
import path from 'path';


const refreshDiploma = async (credentialConfig): Promise<void> => {
    const oldSignedDocument = JSON.parse(await fsp.readFile(path.resolve(__dirname, credentialConfig.path), 'utf8'));
    const vcId = oldSignedDocument['id'];
    // remove old proof
    const { proof: oldProof, ...inputDocument } = oldSignedDocument as any;
    // remove old contexts
    let oldContexts = ['https://w3id.org/security/suites/ed25519-2020/v1', 'https://w3id.org/vc-revocation-list-2020/v1', 'https://www.w3.org/2018/credentials/v1'];
    for (const oldContext of oldContexts) {
        const oldProofContextIndex = inputDocument["@context"].indexOf(oldContext);
        if (oldProofContextIndex !== -1) {
            inputDocument["@context"].splice(oldProofContextIndex, 1);
        }
    }
    // add new contexts
    let newContexts = ['https://w3id.org/security/bbs/v1', 'https://www.w3.org/ns/credentials/v2'];
    for (const newContext of newContexts) {
        const newProofContextIndex = inputDocument["@context"].indexOf(newContext);
        if (newProofContextIndex === -1) {
            inputDocument["@context"].push(newContext);
        }
    }
    // add status
    inputDocument['credentialStatus'] = {
        "id": `${config.status[vcId].listId}#${config.status[vcId].index}`,
        "type": "BitstringStatusListEntry",
        "statusPurpose": "revocation",
        "statusListIndex": config.status[vcId].index,
        "statusListCredential": config.status[vcId].listId
    }
    await fsp.writeFile(path.resolve(__dirname, credentialConfig.path_refresh), JSON.stringify(inputDocument, null, 2));
    console.log(`Input document created for '${credentialConfig.description}'`);
    
    //Sign the input document
    const keyPair = await new Bls12381G2KeyPair(keyPairOptions);
    const signedDocument = await sign(inputDocument, {
        suite: new BbsBlsSignature2020({ key: keyPair }),
        purpose: new purposes.AssertionProofPurpose(),
        documentLoader,
    });
    await fsp.writeFile(path.resolve(__dirname, credentialConfig.path_refresh_signed), JSON.stringify(signedDocument, null, 2));
    console.log(`Input document signed for '${credentialConfig.description}'`);
};

cli(config, refreshDiploma);
