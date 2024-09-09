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
