import {Bitstring} from '@digitalbazaar/bitstring';

async function main() {
    const encodedList = "H4sIAAAAAAAAA-3OMQ0AAAgDsAX_ojkmgoNWQRMAAAAAAAAAAAAAAACg5joAAAA8thU0uuYAQAAA"
    const indexRevoked = 105334;
    const indexValid = 72426;

    const bitsArray = await Bitstring.decodeBits({encoded:encodedList}) ;
    const bitstring = new Bitstring({buffer: bitsArray as Uint8Array});


    console.log(`Revoked at ${indexRevoked} ? ${bitstring.get(indexRevoked) === true}`);
    console.log(`Valid at ${indexRevoked} ? ${bitstring.get(indexValid) === false}`);

}

main();
