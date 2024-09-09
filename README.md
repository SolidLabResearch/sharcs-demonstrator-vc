# README

- [README](#readme)
  - [Features](#features)
    - [Components](#components)
  - [Installation](#installation)
  - [Tests](#tests)

![Overview](img/overview.jpg)

## Features

- Selective disclosure
- Range queries

### Components

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

## Installation

```bash
npm install
```

## Tests

Executing the tests requires
the registry and derive services to be running.

> More information about the tests can be found in [here](./docs/tests.md)

The steps are as follows:

1. Start the registry service.

    ```bash
    npm run service:registry:watch
    ```

2. Start the derive service.

    ```bash
    npm run service:deriver:watch
    ```

3. Run the tests.

    ```bash
    npm run test
    ```
