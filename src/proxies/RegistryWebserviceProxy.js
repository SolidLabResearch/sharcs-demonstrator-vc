import {redactControllerDoc} from "../utils.js";
import {RegistryProxy} from "./RegistryProxy.js";

export class RegistryWebserviceProxy extends RegistryProxy {

    constructor(baseUrl, port) {
        super();
        this.urlRegistry = `${baseUrl}:${port}`
    }

    async resolve(id) {
        const response = await fetch(
            `${this.urlRegistry}/resolve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id
                })
            }
        )
        if (!response.ok)
            throw new Error(`Failed to resolve ${id} from registry`)
        return await response.json()
    }

    async register(id, controllerDoc) {
        const response = await fetch(
            `${this.urlRegistry}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id,
                    controllerDoc: redactControllerDoc(controllerDoc)
                })
            }
        )

        if (!response.ok) {
            throw new Error(`Failed to register ${id}`)
        }


        return await response.json()
    }

    async clearRegistry() {
        const response = await fetch(
            `${this.urlRegistry}/clear`, {
                method: 'POST'
            }
        )
        if (!response.ok)
            throw new Error('Failed to clear registry!')

    }
}
