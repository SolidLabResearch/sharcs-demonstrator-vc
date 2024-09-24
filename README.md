# README

This repository enables **selective disclosure** and **range query proofs**,
applied on Verifiable Credentials.

**Outline**

- [README](#readme)
  - [Features](#features)
    - [Components](#components)
  - [Installation](#installation)
  - [Tests](#tests)

## Overview

![Overview](img/overview.jpg)

### Services

- Backend
  - Registry is used to register and resolve public key material.
  - Signer is used to sign an (unsigned) credential.
  - Deriver allows for selective disclosure and range queries.
- Public
  - Gateway is exposed to the end-users. Internally, the Gateway service coordinates how the backend services work together to apply minimization.

#### Documentation

Each service's API is documented according to the Open API Specification 3.0.0.
Once the services are started (for which you should follow [these instruction](#usage)).
As shown in the following figure,
each service API documentation can be found at <http://localhost/api-docs>.

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

## Tests

Before executing tests,
make sure that all services are up and running.
These services can be run **locally** or in a **Docker** container.
> More information about the tests can be found in [here](./docs/tests.md)

### Setup

#### Local setup

```bash
npm run start
```

#### Docker setup

```bash
./docker-build-image.sh
docker run --rm --name carcharodon -p80:80 -p 3000:3000 -p 4000:4000 sharcs-poc:latest
```

### Run tests

Run all tests as follows: 

```bash
npm run test
```

### Teardown

Tearding down the test setup depends on the chosen test setup (i.e., [local](#local-setup) or [Docker](#docker-setup)) and is explained in the following. 

#### Local teardown

The running services can be stopped as follows:

```bash
pm2 stop all
```

#### Docker teardown

Running Docker containers can be stopped as follows:

```bash
docker ps -aq | xargs docker stop -t 0
```
