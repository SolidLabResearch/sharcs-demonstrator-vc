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
 *
 * Note: This is basically the example demo from the https://github.com/mattrglobal/jsonld-signatures-bbs/ repo --> https://github.com/mattrglobal/jsonld-signatures-bbs/blob/master/sample/ts-node/src/demo_single.ts
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

import inputDocument from "./data/inputDocument.json"; // Original data, without signing hashes etc
import keyPairOptions from "./data/keyPair.json"; // keypair needed to create original VC
import exampleControllerDoc from "./data/controllerDocument.json";
import bbsContext from "./data/bbs.json";
import revealDocument from "./data/deriveProofFrame.json"; // configuration file for selectively disclosing parts of the VC into a VP
import citizenVocab from "./data/citizenVocab.json"; // vocabulary used to describe the original data
import credentialContext from "./data/credentialsContext.json";
import suiteContext from "./data/suiteContext.json";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const documents: any = {
  "did:example:489398593#test": keyPairOptions,
  "did:example:489398593": exampleControllerDoc,
  "https://w3id.org/security/bbs/v1": bbsContext,
  "https://w3id.org/citizenship/v1": citizenVocab,
  "https://www.w3.org/2018/credentials/v1": credentialContext,
  "https://w3id.org/security/suites/jws-2020/v1": suiteContext,
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

  console.log(
    `Attempted to remote load context : '${url}', please cache instead`
  );
  throw new Error(
    `Attempted to remote load context : '${url}', please cache instead`
  );
};

//Extended document load that uses local contexts
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const documentLoader: any = extendContextLoader(customDocLoader);

const main = async (): Promise<void> => {
  console.log("Input document");
  console.log(JSON.stringify(inputDocument, null, 2));

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
  console.log(JSON.stringify(signedDocument, null, 2));

  //STEP 2
  //Verify the proof
  let verified = await verify(signedDocument, {
    suite: new BbsBlsSignature2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log("Verification result");
  console.log(JSON.stringify(verified, null, 2));

  //STEP 3
  // see ./data/deriveProofFrame.json

  //STEP 4
  //Derive a proof
  const derivedProof = await deriveProof(signedDocument, revealDocument, {
    suite: new BbsBlsSignatureProof2020(),
    documentLoader,
  });

  console.log("Derivation result");
  console.log(JSON.stringify(derivedProof, null, 2));

  //STEP 5
  //Verify the derived proof
  verified = await verify(derivedProof, {
    suite: new BbsBlsSignatureProof2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });

  console.log("Verification result");
  console.log(JSON.stringify(verified, null, 2));
};

main();
