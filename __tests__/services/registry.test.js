import {RegistryWebserviceProxy} from "../../src/proxies/RegistryWebserviceProxy.js";
import config from "../../src/config/config.js";
import {logv2} from "../../src/utils.js";

const testRecord = {
    id: 'urn:test:001',
    controllerDoc: {
        id: 'urn:test:001',
        verificationMethod: {
            "id": "urn:test:001#key1",
            "type": "Multikey",
            "controller": "urn:test:001",
            "publicKeyMultibase": "abcdef"
        }
    }
}

const {id, controllerDoc} = testRecord
const registry = new RegistryWebserviceProxy(config.registry.baseUrl, config.registry.port)
beforeEach(async () => {
    // Register (context: Issuer)
    await registry.clearRegistry()

})

test('Register', async () => {
    // Register
    const response = await registry.register(id, controllerDoc)
    expect(response).toEqual({id})
})

test('Resolve', async () => {
    // Register
    await registry.register(id, controllerDoc)
    // Resolve
    const resolvedDoc = await registry.resolve(id)
    expect(resolvedDoc).toEqual(controllerDoc)
})
