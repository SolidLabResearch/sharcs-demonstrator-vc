# README

This repository provides a PoC for applying **selective disclosure** and **range query proofs** on Verifiable Credentials.

**Outline**

- [README](#readme)
  - [Overview](#overview)
    - [Services](#services)
      - [Documentation](#documentation)
    - [Sequence flow](#sequence-flow)
  - [Usage](#usage)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)
    - [Configuration](#configuration)
  - [Tests](#tests)
    - [Teardown](#teardown)
  - [Resources](#resources)
  - [License](#license)

## Overview

![Overview](img/overview.jpg)

### Services

- Backend
  - **Registry** is used to register and resolve public key material.
  - **Deriver** allows for selective disclosure and range queries.
- Public
  - **Gateway** is exposed to the end-users. Internally, this service coordinates the backend services.

#### Documentation

Each service's API is documented according to the Open API Specification 3.0.0.
Once the services are started (for which you should follow [these instructions](#usage)), API documentation can be found at <http://localhost:8080/api-docs>.

![Swagger Service API Documentation](./img/swagger-api-docs.png)

The Gateway service provides the following endpoints:

- `/credentials/derive`: Apply selective disclosure (SD) and range query (RQ) proofs on Verifiable Credentials (VCs).<br><br>
This endpoint takes a Verifiable Credential and minimization scheme as input and results in a Verifiable Presentation
(VP) containing the derived credential.<br><br>
The current examples allow you to apply two different minimization schemes
on different diploma credentials. More specifically, scheme "diploma-minimal" selectively discloses a subset of
the diploma credential's attributes,
while "diploma-rq-toekenningsdatum-after-2000-01-01" creates a range query proof allowing the holder to prove
that the diploma credential's rewarding date is post 01/01/2000.

- `/schemes`: Retrieve the available minimization schemes.

### Sequence flow

As can be seen in the overview diagram, the sequences are as follows:

- (#1) The issuer issues a credential to a holder.

- (#2) For a particular purpose,
the holder minimizes one of its credentials. In order to do that, the holder executes a POST requests on the SHARCS (Gateway) API

- (#3) At this point, the holder received the VP with the derived credential(s) from the SHARCS platform, and presents it to the verifier.

- (#4) Upon receiving the minimized VP, the verifier needs to verify the authenticity and integrity of the data.
  For this, the verifier needs to resolve the issuer's ID.
  
## Usage

### Prerequisites

- Node (developed & tested using Node v20.11.1)
- NPM (developed & tested NPM v10.2.4)
- Docker (developed & tested using Docker v27.2.0)

### Setup

- First time: `npm run docker:build`
- Start server: `npm run docker:start`
- [API documentation](#documentation) available at <http://localhost:8080/api-docs>

### Configuration

- Contexts: this PoC uses pre-downloaded contexts (cfr. [`./src/resources/contexts`](./src/resources/contexts/)) and, thereby, does not rely on public resources/internet connection.
- Credentials:
  - The [original diploma credentials](./__tests__/__fixtures__/vc/athumi/) are signed using the `Ed25519` cryptosuite which does not support selective disclosure and range query proofs. Therefore, several transformations (i.e., preprocessing & resigning using the `bbs-termwise-signature-2023` cryptosuite) were required (cfr., [`E2E: Athumi` testsuite](./__tests__/e2e/athumi.test.js)). The updated version of these credentials can be found at </br>
[`./__tests__/__fixtures__/vc/athumi/bbs-termwise-signature-2023/`](./__tests__/__fixtures__/vc/athumi/bbs-termwise-signature-2023/).
- Selective disclosure: JSON-LD Framing is used to describe which attributes to selectively disclose. The JSON-LD Frames used in this PoC can be found at </br>
[`./__tests__/__fixtures__/selective-disclosure/athumi/`](./__tests__/__fixtures__/selective-disclosure/athumi/).
- Range query: JSON-LD Frames are used to describe which attributes will serve as public and private variables for the range query proof. The JSON-LD Frames used in this PoC can be found at </br>
[`./__tests__/__fixtures__/range-query/athumi/`](./__tests__/__fixtures__/range-query/athumi/)

## Tests

Before executing tests,
make sure that all services are up and running:

```bash
npm run start
```

Run all tests as follows:

```bash
npm run test
```

### Teardown

The running services can be stopped as follows:

```bash
npm run stop
```

## Resources

To support selective disclosure and range query proofs,
this PoC uses <https://github.com/zkp-ld/jsonld-proofs>.

JSON-LD Framing is used to express the disclosure documents.
The interested reader can find more details in [JSON-LD 1.1 Framing
](https://www.w3.org/TR/json-ld11-framing/).
The adventurous developer can explore and experiment with JSON-LD Frames using the
[JSON-LD Playground](https://json-ld.org/playground/).


## License

This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/)
and released under the [MIT license](http://opensource.org/licenses/MIT).