const fsp = require('fs/promises');

const config = require('./config.json');

function init(db, id) {
    db[id] = {
        index: Math.floor(Math.random() * 131072),
        listId: "https://example.com/credentials/status/3"
    }
}

async function revoke(id) {
    const db = config.status
    if (!db[id]) {
        init(db, id);
    }
    db[id].revoked = true;
    await fsp.writeFile('./config.json', JSON.stringify(config, null, 2));
}

async function enable(id) {
    const db = config.status
    if (!db[id]) {
        init(db, id);
    }
    db[id].revoked = false;
    await fsp.writeFile('./config.json', JSON.stringify(config, null, 2));
}

async function main() {
    const ids = {
        bio_bach: "https://solid.api.vlaanderen.be/v1/credentials/0a781bac-9e99-4d81-9e58-642967be620c",
        latijn: "https://solid.api.vlaanderen.be/v1/credentials/8b3912tnc-4f42-2d35-4dk4-848kf84kd89k",
        opticien: "https://solid.api.vlaanderen.be/v1/credentials/2ddh35kd-8djd-d3jr-k32l-k3d83lkcje8jcny6",
        sociologie: "https://solid.api.vlaanderen.be/v1/credentials/0a781bac-9e99-4d81-9e58-642967be620d",
        bio_master: "https://solid.api.vlaanderen.be/v1/credentials/0a781bac-9e99-4d81-9e58-642967be620e"
    };
    for (let index = 0; index < Object.keys(config.status).length; index++) {
        const key = Object.keys(ids)[index];
        await enable(ids[key]);
    }
    await revoke(config.original_credentials[1].id);
}

main();
