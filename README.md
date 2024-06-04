# SHARCS Readme

## Prerequisies / Tested with

- [Bun](https://bun.sh/), ~v1.0.1

## Run

1. Install `bun i`
2. Run the scripts using `bun [script name] [optional index of diploma you want to try]`

## Configuration

- `./data`
  - `./data/context`: all locally downloaded contexts, so the demo doesn't rely on public resources/an internet connection
  - `./data/credentials`: demo VCs
    - issues with these VCs
      - Concept.prefLabel is not defined in the context --> Concept.preferredLabel
      - some old contexts are removed and bbs is added

### steps

- update the 'old' diplomas / store their status, see `01_refresh_diploma.ts`
  - optionally validate using `02_verify.ts`
- minimization
  - when a minimization request arrives, validate the diploma based on the `./data/shape`, using `03_validate.js`
  - minize the diploma based on the `./data/frame`, using `04_minimize.ts`
    - optionally validate using `05_verify.ts`
- status
  - check status
  - update status
  - check status again
  - TODO init status should also create the status doc

## Resouces

- https://github.com/mattrglobal/jsonld-signatures-bbs
    - use for creating the VCs -> JSON-LD?
- https://www.itb.ec.europa.eu/shacl/any/upload : if you don't feel like running validators locally
