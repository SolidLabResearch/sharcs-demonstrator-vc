import { login } from "./login";
import inputDocument from "./data/inputDocument.json";
import { extendContextLoader, sign, verify, purposes } from "jsonld-signatures";
import { signDocument } from "./signing";


const putDocumentOnPod = async (authFetch: any, pathOnServer: string, document: any) => {
  await authFetch(pathOnServer, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
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
  // TODO: key managemtent, password, login credentials
  const email = "a@a", password = "a"
  const { accessToken, dpopKey, authFetch } = await login(email, password)

  // 2. Put initial doc
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
  const signedDocument = await signDocument(response_j)
  const signedDocumentUrl = privateUrl + 'signedDocument'
  // ..store it again..
  await putDocumentOnPod(authFetch, signedDocumentUrl, signedDocument)
  // TODO: verify!


}


init()
