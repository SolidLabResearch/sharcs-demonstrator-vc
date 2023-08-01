import { login } from "./login";
import inputDocument from "./data/inputDocument.json";
import { deriveDocument, signDocument } from "./signing";
import { LoginCredentials } from "./interfaces";


const putDocumentOnPod = async (authFetch: any, pathOnServer: string, document: any) => {
  await authFetch(pathOnServer, {
    method: "PUT",
    headers: {
      "content-type": "application/ld+json",
      "rel": "http://www.w3.org/ns/json-ld#context"
    },
    body: JSON.stringify(document, null, 2)
  })
}


// (0. Setup Pods)
// 1. Get Access Token
// 2. Put initial document on the pod (demo resource)
// 3. Retrieve the initial doc and sign it; store it again => signed document
// 4. Retrieve the signed document, derive the ZKP; store it => derivation
// 5. Retrieve the derivation, verify it
async function init() {

  //await sharcsDemoInitialization()
  // .then(async () => extractPrescriptions())

  // 1. Get Access Token
  // actually only need the authFetch?
  // TODO: key management, password, login credentials
  // TODO: multiple users for signer, holder, verifier
  const credentials: LoginCredentials = { email: "a@a", password: "a" }
  const { accessToken, dpopKey, authFetch } = await login(credentials)

  // 2. Store initial doc
  const baseUrl = "http://localhost:3000/"
  const privateUrl = baseUrl + "a/private/"
  const initialDocUrl = privateUrl + 'initialDoc'
  // TODO: ACL; protect private
  await putDocumentOnPod(authFetch, initialDocUrl, inputDocument) // await needed?
  // TODO ask for status, only continue when 200

  // 3. Retrieve the initial doc
  const response = await authFetch(initialDocUrl); // JSON-LD
  const response_j: JSON = JSON.parse(await response.text());

  // ..sign it..
  const resultSignedDocument = await signDocument(response_j)
  const signatureVerified = resultSignedDocument.verification["verified"]

  // ..store the signed document.
  const signedDocumentUrl = privateUrl + 'signedDocument'
  if (signatureVerified) {
    console.log("Document has been signed and verified.. Storing it on the pod.");
    await putDocumentOnPod(authFetch, signedDocumentUrl, resultSignedDocument.document)
  }

  // 4. Retrieve the signed document, derive the ZKP; store it => derivation
  // TODO: actually check for signed document and retrieve it again -> with multiple pods

  // ..derive the proof..
  const resultDerivedProof = await deriveDocument(resultSignedDocument.document)
  const proofVerified = resultDerivedProof.verification["verified"]
  const derivedProof = resultDerivedProof.document
  console.log(derivedProof);


  // ..store it again.
  const derivedProofUrl = privateUrl + 'derivedProof'
  if (proofVerified) {
    console.log("ZKP proof has been derived and verified. Storing it on the pod.");
    await putDocumentOnPod(authFetch, derivedProofUrl, resultDerivedProof.document)
    console.log(resultDerivedProof.document);

  }

}


init()
