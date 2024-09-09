import {Registry} from "../controllers/registry.js";
import {RegistryProxy} from "./RegistryProxy.js";

export class RegistryMockProxy extends RegistryProxy {
    constructor(keypairs) {
        super();
        this.registry = new Registry()
        keypairs.forEach(async (key) => {
            this.registry.register(key.id, key)
        })
    }

    async resolve(id) {
        return this.registry.resolve(id)
    }

    async register(id, controllerDoc) {
        return this.registry.register(id, controllerDoc)
    }

    async clearRegistry() {
        this.registry.clear()
    }
}
