import {urlDerive} from "../src/config/config.js";
import {readJsonFile} from "../src/utils.js";

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

export async function executeDeriveRequest(vcPairs, predicates, challenge) {
  return await fetch(
    urlDerive,
    {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vcPairs, predicates, challenge })
    }
  )
}
