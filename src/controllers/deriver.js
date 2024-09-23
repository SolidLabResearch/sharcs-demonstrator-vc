import * as zjp from '@zkp-ld/jsonld-proofs';
import {documentLoader as defaultDocumentLoader} from '../documentloader.js';
import keypairsPublic from '../resources/keypairs-public.json' with {type: 'json'};
import cLessThanPrvPub from "../resources/less_than_prv_pub_64.json" with {type: "json"}
import cLessThanPubPrv from '../resources/less_than_pub_prv_64.json' with {type: 'json'};

export class Deriver {
  constructor(registryProxy, documentLoader = defaultDocumentLoader) {
    this.documentLoader = documentLoader;
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
        vcPairs.flatMap(({original}) => {
          let issuer = undefined
          if('https://www.w3.org/2018/credentials#issuer' in original)
            issuer = original['https://www.w3.org/2018/credentials#issuer']['@id']
          else
            issuer = original['issuer']

          return issuer
        })
            .map(async (issuer) => {
              if(issuer === undefined)
                throw new Error('Issuer is undefined!')
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
        this.documentLoader,
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
          this.documentLoader,
          deriveOptions
      )
  }

  async sign(unsigned, privateKeypairs){
    return await zjp.sign(unsigned, privateKeypairs, this.documentLoader)
  }

  async verify(vc, keypairs) {
    return await zjp.verify(vc, keypairs, this.documentLoader)
  }

  async verifyProof(vp, publicKeys, challenge){
    return await zjp.verifyProof(
        vp,
        publicKeys,
        this.documentLoader,
        {
          challenge,
          snarkVerifyingKeys: this.snarkVerifyingKeys
        }
    )
  }
}
