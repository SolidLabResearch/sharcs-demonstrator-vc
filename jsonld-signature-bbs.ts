/*
 * Copyright 2020 - MATTR Limited
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
Prerequisites: original data to accredit: a file in this example (./data/inputDocument.json)
Steps (note that each step could be done by a different actor):
1. sign original data into a VC: see code (should be stored in a pod)
2. verify this VC: see code
3. configure reveal document for selective disclosure: a file in this example (./data/deriveProofFrame.json)
4: make VP with selective disclosure: see code
5: verify this VP: see code
*/

import {
  Bls12381G2KeyPair,
  BbsBlsSignature2020,
  BbsBlsSignatureProof2020,
  deriveProof,
} from "@mattrglobal/jsonld-signatures-bbs";
import { extendContextLoader, sign, verify, purposes } from "jsonld-signatures";

import oldSignedDocument from "./data/credential/getuigschrift_opticien-beroepskennis_Ed25519Signature2020.json"; // Original data, without signing hashes etc

import keyPairOptions from "./data/keyPair.json"; // keypair needed to create original VC
import issuerDoc from "./data/issuer.json";
import keyPairPublic from "./data/keyPair_public.json"; // public key needed to verify VCs

import bbsContext from "./data/context/bbs.json";
import credentialContext from "./data/context/credentials.json";
import credential2Context from "./data/context/credentials2.json";
import suiteContext from "./data/context/suite.json";

import leercredentialContext from "./data/context/leercredential-ap.json";
import leercredentialskosContext from "./data/context/skos-ap.json";

import revealDocument from "./data/frame/frame_leercredential_diplomaniveau.json"; // configuration file for selectively disclosing parts of the VC into a VP
import statusDB from './data/status_db.json';

import fsp from 'fs/promises';
import path from 'path';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const documents: any = {
  "did:example:magda_mock": issuerDoc,
  "did:example:magda_mock#keypair": keyPairPublic,
  "https://w3id.org/security/bbs/v1": bbsContext,
  "https://www.w3.org/2018/credentials/v1": credentialContext,
  "https://www.w3.org/ns/credentials/v2": credential2Context,
  "https://w3id.org/security/suites/jws-2020/v1": suiteContext, // it's not clear where this context comes from
  "https://solid.data.vlaanderen.be/doc/implementatiemodel/leercredential/2023-02-01/context/leercredential-ap.jsonld": leercredentialContext,
  "https://solid.data.vlaanderen.be/doc/implementatiemodel/skos/2023-02-01/context/skos-ap.jsonld": leercredentialskosContext,
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
const documentLoader: any = extendContextLoader(customDocLoader);

const main = async (): Promise<void> => {
  // remove proof
  const { proof: oldProof, ...inputDocument } = oldSignedDocument as any;
  let oldContexts = ['https://w3id.org/security/suites/ed25519-2020/v1', 'https://w3id.org/vc-revocation-list-2020/v1', 'https://www.w3.org/2018/credentials/v1'];
  for (const oldContext of oldContexts) {
    const oldProofContextIndex = inputDocument["@context"].indexOf(oldContext);
    if (oldProofContextIndex !== -1) {
      inputDocument["@context"].splice(oldProofContextIndex, 1);
    }
  }
  let newContexts = ['https://w3id.org/security/bbs/v1', 'https://www.w3.org/ns/credentials/v2'];
  for (const newContext of newContexts) {
    const newProofContextIndex = inputDocument["@context"].indexOf(newContext);
    if (newProofContextIndex === -1) {
      inputDocument["@context"].push(newContext);
    }
  }
  inputDocument['credentialStatus'] = {
    "id": `https://example.com/credentials/status/3#${statusDB[inputDocument['id']].index}`,
    "type": "BitstringStatusListEntry",
    "statusPurpose": "revocation",
    "statusListIndex": statusDB[inputDocument['id']].index,
    "statusListCredential": "https://example.com/credentials/status/3"
  }
  console.log("Input document");
  // console.log(JSON.stringify(inputDocument, null, 2));
  await fsp.writeFile(path.resolve(__dirname, './data/output/test_00_input_document.json'), JSON.stringify(inputDocument, null, 2));
  
  //STEP 1
  //Import the example key pair
  const keyPair = await new Bls12381G2KeyPair(keyPairOptions);
  //Sign the input document
  const signedDocument = await sign(inputDocument, {
    suite: new BbsBlsSignature2020({ key: keyPair }),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log("Input document with proof");
  // console.log(JSON.stringify(signedDocument, null, 2));
  await fsp.writeFile(path.resolve(__dirname, './data/output/test_10_input_document_proof.json'), JSON.stringify(signedDocument, null, 2));

  //STEP 2
  //Verify the proof
  let verified = await verify(signedDocument, {
    suite: new BbsBlsSignature2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log("Verification result");
  // console.log(JSON.stringify(verified, null, 2));
  await fsp.writeFile(path.resolve(__dirname, './data/output/test_20_verified_document.json'), JSON.stringify(verified, null, 2));

  //STEP 3
  // see ./data/frame

  //STEP 4
  //Derive a proof
  const derivedProof = await deriveProof(signedDocument, revealDocument, {
    suite: new BbsBlsSignatureProof2020(),
    documentLoader,
  });

  console.log("Derivation result");
  // console.log(JSON.stringify(derivedProof, null, 2));
  await fsp.writeFile(path.resolve(__dirname, './data/output/test_30_derived_document.json'), JSON.stringify(derivedProof, null, 2));

  //STEP 5
  //Verify the derived proof
  verified = await verify(derivedProof, {
    suite: new BbsBlsSignatureProof2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log("Verification result");
  // console.log(JSON.stringify(verified, null, 2));
  await fsp.writeFile(path.resolve(__dirname, './data/output/test_40_verified_derived_document.json'), JSON.stringify(verified, null, 2));
};

main();
