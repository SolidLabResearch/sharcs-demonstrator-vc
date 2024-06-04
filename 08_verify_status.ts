import { Bitstring } from '@digitalbazaar/bitstring';
import fsp from 'fs/promises';

import config from './config.json';
import { cli } from './util';

async function verify(credentialConfig) {
    const encodedList = JSON.parse(await fsp.readFile('./data/output/status.json', 'utf8')).credentialSubject.encodedList;

    const bitsArray = await Bitstring.decodeBits({ encoded: encodedList });
    const bitstring = new Bitstring({ buffer: bitsArray as Uint8Array });


    console.log(`Revoked at ${credentialConfig.id} ?`);
    console.log(bitstring.get(config.status[credentialConfig.id].index) === true);
}

cli(config, verify);