# Dev doc

- Registry service
    - Endpoints:
        - `/register`: Registers an identifier and its corresponding public key material.
        - `/resolve`: Resolves public key material of a registered ID.
        - `/clear`: Clears the registry. ⚠️ Warning: endpoint is for testing purposes only.
- Deriver service
    - Remark: Circuits SNARK & Verifying Keys are hardcoded in the service.
    - Endpoints:
        - `/derive`: Enables selective disclosure and range queries on Verifiable Credentials (VCs).
            - Parameters
                - `vcPairs`: An array of VCPairs (`VCPair { original: VC; disclosed: VC; }`).
                    - `original`: The document to derive.
                    - `disclosed`: This document describes which attributes to selectively disclose,
                      or which attributes become (public or private) variables for a particular range query proof.
                - `predicates`: This document describes the predicate operations (e.g., less-than) and the corresponding circuits.
                - `challenge`: Challenge string for the blind signature.
            - Output: Verifiable Presentation with derived credentials.
