import {readJsonFile, redactControllerDoc} from "../../src/utils.js";
import config from "../../src/config/config.js";
import {RegistryWebserviceProxy} from "../../src/proxies/RegistryWebserviceProxy.js";
import {actors} from "../actors.js";
import {Deriver} from "../../src/controllers/deriver.js";

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

beforeAll(async () => {
  await registry.clearRegistry()
  await registry.register(actors.issuer0.id,
    redactControllerDoc(actors.issuer0) // redact secret key material
  )
})

test('TEST001 [scheme: diploma-minimal-example]', async () => {
  const unsignedDiplomaCredential = readJsonFile('__tests__/__fixtures__/vc/vc1.json')

  const vc = await deriver.sign(unsignedDiplomaCredential, [actors.issuer0]) // TODO: how to sign the draft vc?

  const response = await fetch(
    urlsGateway.derive, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verifiableCredential: vc,
        scheme: 'diploma-minimal-example'
      })
    }
  )
  expect(response.ok).toBe(true)
  const result = await response.json()
  // Verify
  const challenge = 'abc123' // TODO: HANDLE THIS APPROPRIATELY!
  const publicKeypair = await registry.resolve(actors.issuer0.id)
  const verificationResult = await deriver.verifyProof(result, [publicKeypair], challenge)
  expect(verificationResult.verified).toEqual(true);
})


test.only('TEST002 [scheme: identity-minimal-example]', async () => {
  const minimizationSchemeKey = 'identity-minimal-example'
  const unsignedIdentityCredential = readJsonFile('__tests__/__fixtures__/vc/vc2.json')
  // const vc = await deriver.sign(unsignedIdentityCredential, [actors.issuer0]) // TODO: how to sign the draft vc?

  const response = await fetch(
    urlsGateway.derive, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verifiableCredential: unsignedIdentityCredential,
        scheme: 'identity-minimal-example'
      })
    }
  )
  expect(response.ok).toBe(true)
  const derivedResult = await response.json()

  // Verify
  const challenge = 'abc123' // TODO: HANDLE THIS APPROPRIATELY!
  const publicKeypair = await registry.resolve(actors.issuer0.id)
  const verificationResult = await deriver.verifyProof(derivedResult, [publicKeypair], challenge)
  expect(verificationResult.verified).toEqual(true);
})
