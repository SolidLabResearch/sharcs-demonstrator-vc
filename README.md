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

### Services

To test the services, execute

```bash
npm run test:service
```

### End-to-end

To test end-to-end scenarios, execute:

```bash
npm run test:e2e
```

### Teardown

#### Local setup

The running services can be stopped as follows:

```bash
pm2 stop all
```

#### Docker setup
Running Docker containers can be stopped as follows:

```bash
docker ps -aq | xargs docker stop -t 0
```
