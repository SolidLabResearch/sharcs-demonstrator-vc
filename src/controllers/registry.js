export class Registry {

    constructor() {
        this.db = new Map()
    }

    /**
     * Bulkregister a keypairs.
     *
     * @param keypairs: Object mapping controllerIDs on controller docs -> { [controllerId]: controllerDoc }
     */
    registerBulk(keypairs) {
        for (const cdoc of keypairs) {
            this.register(cdoc.id, cdoc);
        }
    }

    /**
     *
     * @returns {{[p: controllerID]: controllerDoc}}
     */
    getKeypairs() {
        return Object.fromEntries(this.db)
    }

    size() {
        return this.db.size
    }

    register(id, controllerDoc) {
        if (this.has(id)) {
            throw new Error(`"${id}" is already registered.`);
        }
        this.db.set(id, controllerDoc)
    }

    resolve(id) {
        if (!this.has(id)) {
            throw new Error(`"${id}" does not exist.`);
        }
        return this.db.get(id)
    }


    /**
     * Unregisters the object associated with the given key.
     * @param {string} key - The key of the object to unregister.
     * @returns {boolean} - True if the key was found and removed, false otherwise.
     */
    unregister(key) {
        return this._registry.delete(key);
    }

    /**
     * Checks if the registry contains a key.
     * @param {string} key - The key to check for.
     * @returns {boolean} - True if the key is found, false otherwise.
     */
    has(key) {
        return this.db.has(key);
    }

    /**
     * Clears all registrations in the registry.
     */
    clear() {
        this.db.clear();
    }

}
