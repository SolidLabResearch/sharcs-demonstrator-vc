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

### steps

- update the 'old' diplomas / store their status / store them in the solid pods
  - TODO this is currently part of jsonld-signature-bbs.ts instead of a separate script
  - TODO storing their status currently is hardcoded
- minimization
  - when a minimization request arrives, validate the diploma based on the `./data/shape`
  - minize the diploma based on the `./data/frame`
    - TODO this is currently part of jsonld-signature-bbs.ts instead of a separate script
- update status

## Resouces

- https://github.com/mattrglobal/jsonld-signatures-bbs
    - use for creating the VCs -> JSON-LD?
- https://www.itb.ec.europa.eu/shacl/any/upload : if you don't feel like running validators locally
