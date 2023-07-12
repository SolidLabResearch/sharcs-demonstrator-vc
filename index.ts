import { ACL, RDF } from "@solid/community-server";
import { Bindings, QueryBindings } from "@comunica/types";

const baseUrl = "http://localhost:3000/"
const webID = "https://jsteinba.pod.knows.idlab.ugent.be/"
const resource = baseUrl + "diagnosis"
const extractedResource = baseUrl + "prescriptions"

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

  // setup CSS with idp for agent
  // const app = await instantiateCSS(agentPort)
  // await app.start();

  // create account for agent
  // await createAccount(agentBaseUrl, { email: solidAgentMail, password: solidAgentWW, podName: solidAgentPodName })
  // await sleep(500) // TODO: Why sleep?

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

  await sharcsDemoInitialization().then(async () => extractPrescriptions() )

}


sharcsDemo()

// notes
// - should the Agent simulate a user-login? Or should we use clientside tokens instead?
// - use Comunica to access private resources? or should the agent do that?
//  - use Comunica-Solid?
