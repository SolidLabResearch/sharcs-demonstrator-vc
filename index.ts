import { Bindings, QueryBindings } from "@comunica/types";

import inputDocument from "./data/inputDocument.json";
import keyPairOptions from "./data/keyPair.json";
import exampleControllerDoc from "./data/controllerDocument.json";
import bbsContext from "./data/bbs.json";
import revealDocument from "./data/deriveProofFrame.json";
import citizenVocab from "./data/citizenVocab.json";
import credentialContext from "./data/credentialsContext.json";
import suiteContext from "./data/suiteContext.json";

import {
  Bls12381G2KeyPair,
  BbsBlsSignature2020,
  BbsBlsSignatureProof2020,
  deriveProof,
} from "@mattrglobal/jsonld-signatures-bbs";
import { extendContextLoader, sign, verify, purposes } from "jsonld-signatures";


const baseUrl = "http://localhost:3000/"
const webID = "https://jsteinba.pod.knows.idlab.ugent.be/"
const resource = baseUrl + "diagnosis"
const extractedResource = baseUrl + "prescriptions"
const vc = baseUrl + "residenceCard"

const documents: any = {
  "did:example:489398593#test": keyPairOptions,
  "did:example:489398593": exampleControllerDoc,
  "https://w3id.org/security/bbs/v1": bbsContext,
  "https://w3id.org/citizenship/v1": citizenVocab,
  "https://www.w3.org/2018/credentials/v1": credentialContext,
  "https://w3id.org/security/suites/jws-2020/v1": suiteContext,
};
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
}
const documentLoader: any = extendContextLoader(customDocLoader);

// - Does this require the server to be running?
// - How to PUT with correct r/w? By PUT'ing a .acl file?
// - This might require to be logged in though >> access token?!
async function sharcsDemoInitialization() {
  console.log('demo init')

  // create base resource
  await fetch(resource, {
    method: "PUT",
    headers: {
      "content-type": "text/turtle"
    },
    body: `<http://example.com/diagnosis> a <https://schema.org/MedicalCondition>;
  <https://schema.org/associatedDisease> <https://example.org/HIV>;
  <https://schema.org/prescription> <https://example.org/Rekambys>,
    <https://example.org/Vocabria>.`
  })

  // put (signed) credential
  // - can this be stored as non-JSON-LD?
  // - how do we handle this if it is being split up
  // - is this always a 'single' resource/document?
  // - can this be saved as single triples and then re-combined again?
  // - how to deal with different JSON-LD interpretations? flatten, expand, compact, ...
  await fetch(vc, {
    method: "PUT",
    headers: {
      "content-type": "application/ld+json",
      "rel": "http://www.w3.org/ns/json-ld#context"
    },
    body: JSON.stringify(inputDocument, null, 2)
  })

  const jsonld = require('jsonld');
  // serialize a document to N-Quads (RDF)
  const nquads = await jsonld.toRDF(inputDocument, { format: 'application/n-quads' });
  // nquads is a string of N-Quads
  console.log(nquads)

  const keyPair = await new Bls12381G2KeyPair(keyPairOptions);

  ///Sign the input document
  const signedDocument = await sign(inputDocument, {
    suite: new BbsBlsSignature2020({ key: keyPair }),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader,
  });


}


async function generateToken() {

  // This assumes your server is started under http://localhost:3000/.
  // This URL can also be found by checking the controls in JSON responses when interacting with the IDP API,
  // as described in the Identity Provider section.
  const response = await fetch('http://localhost:3000/idp/credentials/', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    // The email/password fields are those of your account.
    // The name field will be used when generating the ID of your token.
    body: JSON.stringify({ email: 'my-email@example.com', password: 'my-account-password', name: 'my-token' }),
  });

  // These are the identifier and secret of your token.
  // Store the secret somewhere safe as there is no way to request it again from the server!
  const { id, secret } = await response.json();
}

async function extractPrescriptions() {
  console.log('extracting prescriptions')

  const QueryEngine = require('@comunica/query-sparql').QueryEngine;
  const myEngine = new QueryEngine();

  const bindingsStream = await myEngine.queryBindings(`
SELECT ?o WHERE {
?s <https://schema.org/prescription> ?o.
} LIMIT 10`, {
    sources: [resource],
  });

  const prescriptions: string[] = []

  bindingsStream.on('data', (binding: Bindings) => {
    const prescription = binding.get('o')?.value
    if (prescription)
      prescriptions.push('<' + prescription + '> a <https://schema.org/Drug>.\n')

    console.log(prescriptions);
  });

  bindingsStream.on('end', () => {
    // The data-listener will not be called anymore once we get here.
    console.log('extraction end')
    writePrescriptionsToNewDocument(prescriptions)
  });

}



async function writePrescriptionsToNewDocument(data: string[]) {
  console.log('writing prescriptions to new file')
  console.log('data is ' + data)

  let prescriptions = ''

  data.forEach(prescription => {
    prescriptions = prescriptions + prescription
  });

  prescriptions = prescriptions + '<http://example.com/hash-of-diagnosis> a <http://example.com/VC>.'

  console.log(prescriptions)

  // create resource
  await fetch(extractedResource, {
    method: "PUT",
    headers: {
      "content-type": "text/turtle"
    },
    body: prescriptions
  })

}



async function sharcsDemo() {

  await sharcsDemoInitialization()
  // .then(async () => extractPrescriptions())


}


sharcsDemo()

// notes
// - should the Agent simulate a user-login? Or should we use clientside tokens instead?
// - use Comunica to access private resources? or should the agent do that?
//  - use Comunica-Solid?
