import {Registry} from "../../src/controllers/registry.js";
import keypairsPublic from "../../src/resources/keypairs-public.json";

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

test('Key registration', async () => {
    const registry = new Registry();
    // Test
    const {id, controllerDoc} = testRecord
    registry.register(id, controllerDoc)
    expect(registry.resolve(id)).toEqual(controllerDoc)

    // Test clear
    registry.clear()
    expect(registry.size()).toEqual(0)
})

test('Clear registry', async () => {
    const registry = new Registry();
    // Test
    const {id, controllerDoc} = testRecord
    registry.register(id, controllerDoc)
    // Test clear
    registry.clear()
    expect(registry.size()).toEqual(0)
})

test('Bulk registration', async () => {
    const registry = new Registry();
    // Test bulk registering
    registry.registerBulk(keypairsPublic)
    expect(registry.size()).toEqual(keypairsPublic.length)
    const result = registry.getKeypairs()
    expect(Object.entries(result).length).toEqual(keypairsPublic.length);
})
