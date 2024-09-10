import { readJsonFile } from "./util.js";
import config from "./src/config/config.js";

const urlGateway = `${config.gateway.baseUrl}:${config.gateway.port}`
const urlsGateway = {
    base: urlGateway,
    derive: `${urlGateway}/credentials/derive`,
    schemes: `${urlGateway}/schemes`,
}

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
console.log(response.ok);
console.log(await response.json())
