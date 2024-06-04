const fsp = require('fs/promises');
const path = require('path');

(async function main() {
    const config = JSON.parse(await fsp.readFile(path.resolve(__dirname, './config.json'), 'utf8'));
    for (let index = 0; index < config.original_credentials.length; index++) {
        const element = config.original_credentials[index];
        element.path_refresh = './data/output/' + path.basename(element.path, '.json') + '.01refreshed.json'
        element.path_refresh_signed = './data/output/' + path.basename(element.path, '.json') + '.01signed.json'
        element.path_original_verified = './data/output/' + path.basename(element.path, '.json') + '.02verified.json'
        element.path_derived = './data/output/' + path.basename(element.path, '.json') + '.03derived.json'
        element.path_derived_verified = './data/output/' + path.basename(element.path, '.json') + '.04verified.json'
        element.path_status = './data/output/' + path.basename(element.path, '.json') + '.05status.json'
        element.path_status_result = './data/output/' + path.basename(element.path, '.json') + '.06statusresult.json'
    }
    await fsp.writeFile(path.resolve(__dirname, './config.json'), JSON.stringify(config, null, 2));
})()
