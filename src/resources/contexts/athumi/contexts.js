
import bbsContext from "./bbs.json" with { type: "json" };
import credentialContext from "./credentials.json" with { type: "json" };
import credential2Context from "./credentials2.json" with { type: "json" };
import suiteContext from "./suite.json" with { type: "json" };

import leercredentialContext from "./leercredential-ap.json" with { type: "json" };
import leercredentialskosContext from "./skos-ap.json" with { type: "json" };

const mocks = {
    magda: {
        keypair: {
            "id": "did:example:magda_mock#keypair",
            "controller": "did:example:magda_mock",
            "publicKeyBase58": "oqpWYKaZD9M1Kbe94BVXpr8WTdFBNZyKv48cziTiQUeuhm7sBhCABMyYG4kcMrseC68YTFFgyhiNeBKjzdKk9MiRWuLv5H4FFujQsQK2KTAtzU8qTBiZqBHMmnLF4PL7Ytu"
        },
        controllerDoc: {
            "@context": "https://w3id.org/security/v2",
            "id": "did:example:magda_mock",
            "assertionMethod": ["did:example:magda_mock#keypair"]
        }
    }
}
export const CONTEXTS = {
    "did:example:magda_mock": mocks.magda.controllerDoc,
    "did:example:magda_mock#keypair": mocks.magda.keypair,
    "https://w3id.org/security/bbs/v1": bbsContext,
    "https://www.w3.org/2018/credentials/v1": credentialContext,
    "https://www.w3.org/ns/credentials/v2": credential2Context,
    "https://www.w3.org/ns/credentials/examples/v2": {},
    "https://w3id.org/security/suites/jws-2020/v1": suiteContext, // it's not clear where this context comes from
    "https://solid.data.vlaanderen.be/doc/implementatiemodel/leercredential/2023-02-01/context/leercredential-ap.jsonld": leercredentialContext,
    "https://solid.data.vlaanderen.be/doc/implementatiemodel/skos/2023-02-01/context/skos-ap.jsonld": leercredentialskosContext,
}


