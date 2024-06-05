// const zjp = require('@zkp-ld/jsonld-proofs');
import * as zjp from '@zkp-ld/jsonld-proofs'
import keypairs from './resources/keypairs.json' assert { type: "json" };
// import vcDraft from './resources/vc2.json' assert { type: "json" };
// import vcDisclosed from './resources/disclosed2.json' assert { type: "json" };
// import circuit from './resources/less_than_prv_pub_64.json' assert { type: "json" };
import cLessThanPrvPub from './resources/less_than_prv_pub_64.json' assert { type: "json" };
// import cLessThanPubPrv from './resources/less_than_pub_prv_64.json' assert { type: "json" };
import {demoConfigurations} from './demoConfigurations.js';
import {documentLoader} from './documentloader.js';

import {readJsonFile} from './utils.js';
/**
 * TODOs
 * - [x] make it work with the original example
 * - [ ] change example inputs to payslip use case
 */


// const {r1cs, wasm, provingKey } = circuit
// const circuits = {
//   // [circuit.id]: { r1cs, wasm, provingKey }
//   [circuit.id]: circuit
// }
// const predicates = [
//   {
//     '@context': 'https://zkp-ld.org/context.jsonld',
//     type: 'Predicate',
//     circuit: 'circ:lessThanPrvPub',
//     private: [
//       {
//         type: 'PrivateVariable',
//         var: 'lesser',
//         val: '_:Y',
//       },
//     ],
//     public: [
//       {
//         type: 'PublicVariable',
//         var: 'greater',
//         val: {
//           '@value': '50000',
//           '@type': 'xsd:integer',
//         },
//       },
//     ],
//   },
// ]


async function main() {
  const {circuits, predicates, vcRecords } = demoConfigurations['example-01']
  console.log('SIGN')
  const vcr = vcRecords[0] // ⚠️ TODO: loop through vcRecords
  
  // Unsigned credential
  const vcDraft = readJsonFile(vcr.unsigned)
  
  // TODO: document vc
  const vc = await zjp.sign(vcDraft, keypairs, documentLoader)
  // TODO: document vcDisclosed
  const vcDisclosed = readJsonFile(vcr.disclosed)
  
  console.log('DERIVE')
  const vcPairs = [
    { original: vc, disclosed: vcDisclosed },
  ]
  const challenge = 'abc123'
  const deriveOptions = {
    challenge,
    predicates,
    circuits
  }
  
  const vp = await zjp.deriveProof(
    vcPairs,
    keypairs,
    documentLoader,
    deriveOptions
  )

  console.log('VERIFY')
  
  const verifyOptions = {
    challenge,
    snarkVerifyingKeys: {
      [cLessThanPrvPub.id]: cLessThanPrvPub.provingKey
    }
  }
  
  const verificationResult = await zjp.verifyProof(
    vp,
    keypairs,
    documentLoader,
    verifyOptions
  )

  console.log({verificationResult})
  
}
main().then(() => console.log('done')).catch(console.error)
