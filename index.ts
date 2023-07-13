import { Bindings, QueryBindings } from "@comunica/types";
import inputDocument from "./data/inputDocument.json";

const baseUrl = "http://localhost:3000/"
const webID = "https://jsteinba.pod.knows.idlab.ugent.be/"
const resource = baseUrl + "diagnosis"
const extractedResource = baseUrl + "prescriptions"
const vc = baseUrl + "residenceCard"

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
      "content-type": "application/ld+json"
    },
    body: JSON.stringify(inputDocument, null, 2)
  })

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
    .then(async () => extractPrescriptions() )
    .then(
() => console.log('')
    )

}


sharcsDemo()

// notes
// - should the Agent simulate a user-login? Or should we use clientside tokens instead?
// - use Comunica to access private resources? or should the agent do that?
//  - use Comunica-Solid?
