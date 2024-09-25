import {readJsonFile, redactControllerDoc} from "../../src/utils.js";
import config from "../../src/config/config.js";
import {RegistryWebserviceProxy} from "../../src/proxies/RegistryWebserviceProxy.js";
import {actors} from "../actors.js";
import {Deriver} from "../../src/controllers/deriver.js";
import path from "path";
import {checkVP, loadVcResources} from "../helpers.js";

const urlGateway = `${config.gateway.baseUrl}:${config.gateway.port}`
const urlsGateway = {
  base: urlGateway,
  derive: `${urlGateway}/credentials/derive`,
  schemes: `${urlGateway}/schemes`,
}
const registry = new RegistryWebserviceProxy(
  config.registry.baseUrl,
  config.registry.port
)
const deriver = new Deriver(registry)
const challenge = 'abc123' // TODO: HANDLE THIS APPROPRIATELY!

beforeAll(async () => {
  await registry.clearRegistry()
  await registry.register(actors.issuer0.id,
    redactControllerDoc(actors.issuer0) // redact secret key material
  )
})

/**
 * [HELPER]
 * Executes POST request to the Gateway's /derive endpoint.
 * @param body
 * @returns {Promise<Response<any, Record<string, any>, number>>}
 */
async function executeGatewayDeriveRequest (body) {
  return await fetch(
    urlsGateway.derive, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    }
  )

}

describe('Gateway service: Basic tests', () => {

  test('Should fail when providing incorrect parameters', async () => {
    const response = await executeGatewayDeriveRequest({
      verifiableCredential: {},
      scheme: 'diploma-minimal-example'
    })
    expect(response.status).toBe(400)
  })

  test('Should fail when providing non-existing scheme', async () => {
    const response = await executeGatewayDeriveRequest({
      verifiableCredential: {},
      options: { scheme: 'non-existing-scheme' }
    })
    expect(response.status).toBe(400)
  })

  test('TEST001 [scheme: diploma-minimal-example]', async () => {
    const unsignedDiplomaCredential = readJsonFile('__tests__/__fixtures__/vc/vc1.json')
    const vc = await deriver.sign(unsignedDiplomaCredential, [actors.issuer0]) // TODO: how to sign the draft vc?

    const response = await executeGatewayDeriveRequest({
          verifiableCredential: vc,
          options: { scheme: 'diploma-minimal-example' }
    })
    expect(response.ok).toBe(true)
    const result = await response.json()
    // Verify
    const publicKeypair = await registry.resolve(actors.issuer0.id)
    const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
  })

  test('TEST002 [scheme: identity-minimal-example]', async () => {
    const unsignedIdentityCredential = readJsonFile('__tests__/__fixtures__/vc/vc2.json')
    const vc = await deriver.sign(unsignedIdentityCredential, [actors.issuer0])

    const response = await executeGatewayDeriveRequest({
      verifiableCredential: vc,
      options: { scheme: 'identity-minimal-example' }
    })

    expect(response.ok).toBe(true)
    const derivedResult = await response.json()

    // Verify
    const publicKeypair = await registry.resolve(actors.issuer0.id)
    const verificationResult = await deriver.verifyProof(derivedResult, [publicKeypair], challenge)
    expect(verificationResult.verified).toEqual(true);
  })
});

describe('Gateway service: Athumi tests (cryptosuite: bbs-termwise-signature-2023)', ()=>{
  const vcDir = path.resolve('__tests__/__fixtures__/vc/athumi/bbs-termwise-signature-2023')
  const schemes = [
    'diploma-minimal',
    'diploma-rq-toekenningsdatum-after-2000-01-01'
  ]

  loadVcResources(vcDir)
    // Iterate over VCs
    .forEach(vrr => {
      // Iterate over schemes
      schemes.forEach(scheme => {
        test(`${vrr.fname} - scheme: ${scheme}`, async ()=> {
          const response = await executeGatewayDeriveRequest({
            verifiableCredential: vrr.vc,
            options: { scheme  }
          })
          expect(response.ok).toBe(true)

          const vp = await response.json()
          checkVP(vp)
          const verificationResult = await deriver.verifyProof(vp, await deriver.resolvePublicKeysForVP(vp), challenge)
          expect(verificationResult.verified).toBe(true)
        })
      })
    })
})
