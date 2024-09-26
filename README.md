# README

This repository provides a PoC for applying **selective disclosure** and **range query proofs** on Verifiable Credentials.

**Outline**

- [README](#readme)
  - [Overview](#overview)
    - [Services](#services)
      - [Documentation](#documentation)
    - [Sequence flow](#sequence-flow)
  - [Usage](#usage)
  - [Tests](#tests)
    - [Setup](#setup)
      - [Local setup](#local-setup)
      - [Docker setup](#docker-setup)
    - [Run tests](#run-tests)
    - [Teardown](#teardown)
      - [Local teardown](#local-teardown)
      - [Docker teardown](#docker-teardown)

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

### Sequence flow

As can be seen in the overview diagram, the sequences are as follows:

- (#1) The issuer issues a credential to a holder.

- (#2) For a particular purpose,
the holder minimizes one of its credentials. In order to do that, the holder executes a POST requests on the SHARCS (Gateway) API

- (#3) At this point, the holder received the VP with the derived credential(s) from the SHARCS platform, and presents it to the verifier.

- (#4) Upon receiving the minimized VP, the verifier needs to verify the authenticity and integrity of the data.
  For this, the verifier needs to resolve the issuer's ID.

  
## Usage

```bash
npm install
npm run start
```

Navigate to
<http://localhost:8080/api-docs> to explore the Swagger API Docs.

## Tests

Before executing tests,
make sure that all services are up and running.
These services can be run **locally** or in a **Docker** container.

### Setup

#### Local setup

```bash
npm run start
```

#### Docker setup

```bash
npm run docker:build
npm run docker:start
```

### Run tests

Run all tests as follows: 

```bash
npm run test
```

### Teardown

Tearing down the test setup depends on the chosen test setup (i.e., [local](#local-setup) or [Docker](#docker-setup)) and is explained in the following. 

#### Local teardown

The running services can be stopped as follows:

```bash
pm2 stop all
```

#### Docker teardown

Running Docker containers can be stopped as follows:

```bash
npm run docker:stop
```
