import rdf from '@zazuko/env-node';
import path from 'path';
import fsp from 'fs/promises';
import SHACLValidator from 'rdf-validate-shacl';
const jsonld = require("jsonld");

async function main() {
  const shapePath = './data/shape/leercredential-ap-SHACL.ttl';
  const dataPath = './data/credential/masterofscience_biologie_Ed25519Signature2020.json';

  // We first expand the data with local context files - for debugging;
  const CONTEXTS = {
    "https://solid.data.vlaanderen.be/doc/implementatiemodel/leercredential/2023-02-01/context/leercredential-ap.jsonld": JSON.parse(await fsp.readFile(path.resolve(__dirname, './data/context/leercredential-ap.json'))),
    "https://solid.data.vlaanderen.be/doc/implementatiemodel/skos/2023-02-01/context/skos-ap.jsonld": JSON.parse(await fsp.readFile(path.resolve(__dirname, './data/context/skos-ap.json'))),
    "https://www.w3.org/2018/credentials/v1": JSON.parse(await fsp.readFile(path.resolve(__dirname, './data/context/credentials.json'))),
    "https://www.w3.org/ns/credentials/v2": JSON.parse(await fsp.readFile(path.resolve(__dirname, "./data/context/credentials2.json"))),
    "https://w3id.org/security/bbs/v1": {}
  };

  // grab the built-in Node.js doc loader
  const nodeDocumentLoader = jsonld.documentLoaders.node();

  // change the default document loader
  const customLoader = async (url, options) => {
    if (url in CONTEXTS) {
      return {
        contextUrl: null, // this is for a context via a link header
        document: CONTEXTS[url], // this is the actual document that was loaded
        documentUrl: url // this is the actual context URL after redirects
      };
    }
    // call the default documentLoader
    return nodeDocumentLoader(url);
  };
  jsonld.documentLoader = customLoader;

  const expanded = await jsonld.expand(JSON.parse(await fsp.readFile(dataPath)));
  const expandedPath = dataPath + '.expanded.json';
  await fsp.writeFile(expandedPath, JSON.stringify(expanded, null, 2));

  const shapes = await rdf.dataset().import(rdf.fromFile(shapePath))
  const data = await rdf.dataset().import(rdf.fromFile(expandedPath))

  const validator = new SHACLValidator(shapes, { factory: rdf })
  const report = await validator.validate(data)

  // Check conformance: `true` or `false`
  console.log(report.conforms)

  // Validation report as RDF dataset
  console.log(await report.dataset.serialize({ format: 'text/n3' }))
}

main();
