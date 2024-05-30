# SHARCS Readme

## Prerequisies / Tested with

- [Node.js](https://nodejs.org/en), ~v20.12.2
- [yarn](https://yarnpkg.com/)

## Run

1. Install `yarn i`
2. Run the jsonld-proof-demo `.\node_modules\.bin\ts-node jsonld-signature-bbs.ts`

## Configuration

- `./data`
  - `./data/context`: all locally downloaded contexts, so the demo doesn't rely on public resources/an internet connection
  - `./data/credentials`: demo VCs
    - issues with these VCs
      - Concept.prefLabel is not defined in the context --> Concept.preferredLabel
      - some old contexts are removed and bbs is added


## Resouces

- https://github.com/mattrglobal/jsonld-signatures-bbs
    - use for creating the VCs -> JSON-LD?
