const fsp = require('fs/promises');

async function revoke(id) {
    const db = JSON.parse(await fsp.readFile('./data/status_db.json', 'utf8'));
    if (!db[id]) {
        db[id] = {
            index: Math.floor(Math.random() * 131072)
        }
    }
    db[id].revoked = true;
    await fsp.writeFile('./data/status_db.json', JSON.stringify(db, null, 2));
}

async function enable(id) {
    const db = JSON.parse(await fsp.readFile('./data/status_db.json', 'utf8'));
    if (!db[id]) {
        db[id] = {
            index: Math.floor(Math.random() * 131072)
        }
    }
    db[id].revoked = false;
    await fsp.writeFile('./data/status_db.json', JSON.stringify(db, null, 2));
}

async function main() {
    const ids = {
        bio_bach: "https://solid.api.vlaanderen.be/v1/credentials/0a781bac-9e99-4d81-9e58-642967be620c",
        latijn: "https://solid.api.vlaanderen.be/v1/credentials/8b3912tnc-4f42-2d35-4dk4-848kf84kd89k",
        opticien: "https://solid.api.vlaanderen.be/v1/credentials/2ddh35kd-8djd-d3jr-k32l-k3d83lkcje8jcny6",
        sociologie: "https://solid.api.vlaanderen.be/v1/credentials/0a781bac-9e99-4d81-9e58-642967be620d",
        bio_master: "https://solid.api.vlaanderen.be/v1/credentials/0a781bac-9e99-4d81-9e58-642967be620e"
    };
    for (let index = 0; index < Object.keys(ids).length; index++) {
        const key = Object.keys(ids)[index];
        await enable(ids[key]);
    }
    await revoke(ids.latijn);
}

main();
