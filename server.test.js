import { readJsonFile } from "./util.js";
import config from "./src/config/config.js";
import assert from "assert";
const urlGateway = `${config.gateway.baseUrl}:${config.gateway.port}`
const urlsGateway = {
    base: urlGateway,
    derive: `${urlGateway}/credentials/derive`,
    schemes: `${urlGateway}/schemes`,
    keys: `${urlGateway}/keys/public`,
}

async function testDerive() {
    const diplomaCredential = readJsonFile('./data/output/bachelorofscience_biologie_Ed25519Signature2020.01signed.json')

    const response = await fetch(
        urlsGateway.derive, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            verifiableCredential: diplomaCredential,
            options: { scheme: 'diploma-minimal' }
        })
    }
    )
    assert(response.ok)
    console.log(await response.json())
}

async function testPublicKey() {
    const response = await fetch(
        urlsGateway.keys, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        
    }
    )
    assert(response.ok)
    const key = await response.json()
    console.log(key)
}

testDerive().then().catch(console.error)
testPubicKey().then().catch(console.error)