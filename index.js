// const zjp = require('@zkp-ld/jsonld-proofs');
import * as zjp from '@zkp-ld/jsonld-proofs'
import keypairs from './resources/keypairs.json' assert { type: "json" };
import vcDraft from './resources/vc2.json' assert { type: "json" };
import vcDisclosed from './resources/disclosed2.json' assert { type: "json" };
import circuit from './resources/less_than_prv_pub_64.json' assert { type: "json" };
import {documentLoader} from './documentloader.js';

/**
 * TODOs
 * - [ ] make it work with the original example
 * - [ ] change example inputs to payslip use case
 */

const {r1cs, wasm, provingKey } = circuit
const circuits = {
  [circuit.id]: { r1cs, wasm, provingKey }
}
const predicates = [
  {
    '@context': 'https://zkp-ld.org/context.jsonld',
    type: 'Predicate',
    circuit: 'circ:lessThanPrvPub',
    private: [
      {
        type: 'PrivateVariable',
        var: 'lesser',
        val: '_:Y',
      },
    ],
    public: [
      {
        type: 'PublicVariable',
        var: 'greater',
        val: {
          '@value': '50000',
          '@type': 'xsd:integer',
        },
      },
    ],
  },
]


async function main() {

  console.log('SIGN')
  const vc = await zjp.sign(vcDraft, keypairs, documentLoader)
  const vcPairs = [
    { original: vc, disclosed: vcDisclosed },
  ]
  
  const deriveOptions = {
    challenge: 'abc123',
    predicates,
    circuits
  }

  console.log('DERIVE')
  const vp = await zjp.deriveProof(
    vcPairs,
    keypairs,
    documentLoader,
    deriveOptions
  )
  console.log(vp)
}
main().then(() => console.log('done')).catch(console.error)