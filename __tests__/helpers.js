import {urlDerive} from "../src/config/config.js";
import {clone, readJsonFile} from "../src/utils.js";
import fs from "fs";
import path from "path";

/**
 * [Helper] Structural tests for a VP resulting from /derive
 * @param vp
 */
export const checkVP = (vp) => {
  // vp
  expect(vp.proof).toHaveProperty('type')
  expect(vp.proof).toHaveProperty('proofValue')
  // vc
  const {verifiableCredential} = vp
  expect(verifiableCredential.proof).toHaveProperty('type')
  expect(verifiableCredential.proof).toHaveProperty('verificationMethod')
}

/**
 * TODO: refactor to src/utils
 * @param vcPairs
 * @param predicates
 * @param challenge
 * @returns {Promise<Response<any, Record<string, any>, number>>}
 */
export async function executeDeriveRequest(vcPairs, predicates, challenge) {
  return await fetch(
    urlDerive,
    {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vcPairs, predicates, challenge })
    }
  )
}

/**
 * TODO: Refactor
 * [HELPER]
 * Loads VC resources from given directory.
 * @param directory
 * @returns {{data: *, fpath: string | *}[]}
 */
export function loadVcResources(directory) {
  return fs.readdirSync(directory)
    .filter(x => x.endsWith('.json')||x.endsWith('.jsonld'))
    .map(f => {
      const fpath = path.join(directory, f)

      return {fpath, vc: readJsonFile(fpath), fname: path.basename(fpath)}
    })
}

export function preprocessContext(old) {
  let updated = clone(old)
  updated['@context'] = [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/ns/data-integrity/v1",
    "https://solid.data.vlaanderen.be/doc/implementatiemodel/leercredential/2023-02-01/context/leercredential-ap.jsonld",
    "https://solid.data.vlaanderen.be/doc/implementatiemodel/skos/2023-02-01/context/skos-ap.jsonld"
  ]
  return updated
}

function preprocessMetadata(old) {
  let updated = clone(old)
  updated['issuer'] = 'did:example:issuer0'
  return updated
}

function preprocessVcProof(old) {
  let updated = clone(old)
  // TODO: the updated proof's verificationMethod contains fixed reference to issuer
  updated['proof'] = {
    "type": "DataIntegrityProof",
    "cryptosuite": "bbs-termwise-signature-2023",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:example:issuer0#bls12_381-g2-pub001",
    "@context": "https://www.w3.org/ns/data-integrity/v1"
  }
  return updated
}

export function preprocessVC(old) {
  let updated = clone(old)
  updated = preprocessContext(updated)
  updated = preprocessMetadata(updated)
  updated = preprocessVcProof(updated)
  return updated
}
