import rdf from '@zazuko/env-node';
import SHACLValidator from 'rdf-validate-shacl';
import jsonld from 'jsonld';

import config from './config.json';

import bbsContext from "./data/context/bbs.json";
import credentialContext from "./data/context/credentials.json";
import credential2Context from "./data/context/credentials2.json";
import suiteContext from "./data/context/suite.json";

import leercredentialContext from "./data/context/leercredential-ap.json";
import leercredentialskosContext from "./data/context/skos-ap.json";

import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

const validateDiploma = async (credentialConfig) => {
  const shapePath = './data/shape/leercredential-ap-SHACL.ttl';
  const dataPath = credentialConfig.path_refresh_signed;

  // We first expand the data with local context files - we write them away for debugging;
  const CONTEXTS = {
    "https://w3id.org/security/bbs/v1": bbsContext,
    "https://www.w3.org/2018/credentials/v1": credentialContext,
    "https://www.w3.org/ns/credentials/v2": credential2Context,
    "https://w3id.org/security/suites/jws-2020/v1": suiteContext, // it's not clear where this context comes from
    "https://solid.data.vlaanderen.be/doc/implementatiemodel/leercredential/2023-02-01/context/leercredential-ap.jsonld": leercredentialContext,
    "https://solid.data.vlaanderen.be/doc/implementatiemodel/skos/2023-02-01/context/skos-ap.jsonld": leercredentialskosContext,
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

  const expanded = await jsonld.expand(JSON.parse(await readFile(resolve(dataPath), 'utf8')));
  const expandedPath = dataPath + '.expanded.json';
  await writeFile(expandedPath, JSON.stringify(expanded, null, 2));

  const shapes = await rdf.dataset().import(rdf.fromFile(shapePath))
  const data = await rdf.dataset().import(rdf.fromFile(expandedPath))

  const validator = new SHACLValidator(shapes, { factory: rdf })
  const report = await validator.validate(data)

  // Check conformance: `true` or `false`
  console.log(report.conforms)

  // Validation report as RDF dataset
  console.log(await report.dataset.serialize({ format: 'text/n3' }))
}

async function cli(config, fn) {
  console.log(`Usage: script.js [index of credential in config.json, doing all by default]`);
  if (process.argv[2]) {
      fn(config.original_credentials[process.argv[2]])
  } else {
      for (let index = 0; index < config.original_credentials.length; index++) {
          const element = config.original_credentials[index];
          await fn(element);
      }
  }
}

cli(config, validateDiploma);
