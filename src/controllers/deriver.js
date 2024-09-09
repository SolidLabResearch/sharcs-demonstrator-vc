import * as zjp from '@zkp-ld/jsonld-proofs';
import {documentLoader} from '../documentloader.js';
import keypairsPublic from '../resources/keypairs-public.json' with {type: 'json'};
import cLessThanPrvPub from "../resources/less_than_prv_pub_64.json" with {type: "json"}
import cLessThanPubPrv from '../resources/less_than_pub_prv_64.json' with {type: 'json'};

export class Deriver {
  constructor(registryProxy) {
    this.registry = registryProxy;
    this.circuits = {
      [cLessThanPrvPub.id]: cLessThanPrvPub,
      [cLessThanPubPrv.id]: cLessThanPubPrv
    }
    this.snarkVerifyingKeys = Object.fromEntries(
        Object.entries(this.circuits).map(([cId, c]) => [cId, c.provingKey])
    )
  }

  async resolveControllerDocumentsForVcPairs(vcPairs) {

    return await Promise.all(
        vcPairs.flatMap(({original}) => original.issuer)
            .map(async (issuer) => {
              return await this.registry.resolve(issuer)
            })
    )


  }

  async sd(vcPairs, challenge){
    const resolvedControllerDocuments = keypairsPublic

    const deriveOptions = { challenge,}
    const deriveResult = await zjp.deriveProof(
        vcPairs,
        resolvedControllerDocuments,
        documentLoader,
        deriveOptions
    )
    return deriveResult
  }

  async rq(vcPairs, predicates, challenge){
    const resolvedControllerDocuments = await this.resolveControllerDocumentsForVcPairs(vcPairs);

    const deriveOptions = { challenge, predicates, circuits: this.circuits}
    return await zjp.deriveProof(
          vcPairs,
          resolvedControllerDocuments,
          documentLoader,
          deriveOptions
      )
  }

  async sign(unsigned, privateKeypairs){
    return await zjp.sign(unsigned, privateKeypairs, documentLoader)
  }

  async verify(vc, keypairs) {
    return await zjp.verify(vc, keypairs, documentLoader)
  }

  async verifyProof(vp, publicKeys, challenge){
    return await zjp.verifyProof(
        vp,
        publicKeys,
        documentLoader,
        {
          challenge,
          snarkVerifyingKeys: this.snarkVerifyingKeys
        }
    )
  }
}
