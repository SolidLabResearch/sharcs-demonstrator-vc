import credentials_v1 from './credentials_v1.json' assert { type: "json" };
import data_integrity_v1 from './data-integrity-v1.json' assert { type: "json" };
import did_v1 from './did-v1.json' assert { type: "json" };
import multikey_v1 from './multikey-v1.json' assert { type: "json" };
import schemaorg from './schemaorg.json' assert { type: "json" };
import zkpld from './zkp-ld.json' assert { type: "json" };
// export default  [
//   credentials_v1,
//   data_integrity_v1,
//   did_v1,
//   multikey_v1,
//   schemaorg,
//   zkpld
// ]

export const DATA_INTEGRITY_CONTEXT = 'https://www.w3.org/ns/data-integrity/v1';

export const CONTEXTS = {
  'https://www.w3.org/2018/credentials/v1': credentials_v1,
  'https://schema.org/': schemaorg,
  'https://w3id.org/security/multikey/v1': multikey_v1,
  'https://www.w3.org/ns/did/v1': did_v1,
  'https://zkp-ld.org/context.jsonld': zkpld,
  [DATA_INTEGRITY_CONTEXT]: data_integrity_v1,
}