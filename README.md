# SHARCS Readme

## Run

1. Install `yarn i`
2. Start the CSS `npx @solid/community-server -c @css:config/file-no-setup.json -f ./.data`
3. Run the demo `ts-node index.ts`
3. Run the jsonld-proof-demo `ts-node jsonld-signature-bbs.ts`


## Steps

- [X] create resorce for medical report (diagnosis)
  - [ ] store VC/signature about origin of medical report; must show it has not been tampered with
  - [ ] ACL, allow only agent to access the medical record
- [X] extract prescriptions from medical report
- [X] write prescriptions to new document
  - [ ] issue new VC about prescription-document
    - [ ] prescription-VC must show provenance and link to original medical report; is proof that created prescription-document has not been tampered with
  - [ ] ACL, allow only agent to access prescription-document

### Fixme/Other

- how to set correct prefixes in the created turtle document? 
- do we actually need agents?
- does usage of Comunica for existing/creating the prescription-document make sense?

## Questions


- What happens if the medical report gets updated/changes? Can existing prescription-VCs still be used?
  - Assumption: It doesn't change; if it does we need to change it
- The prescription-VC (or signature?) shows that Alice is the owner/creator, but it does not show that she didn't tamper with the data, ie. make up some numbers
  - https://w3c.github.io/vc-data-integrity/
  - use hash/derivation of medical-report/VC?
  - does ZKP make senes? --> I don't fully understand it yet
    - ZKP is a wrapper around the medical report; it can be used to reveal only the prescriptions?
    - ZKP proof that the extracted triples indeed come from the medical report, without needing to show the medical report
    - Alice is prover, Bob is verified? Alice needs to proove to Bob that she knows the medical report?


## Resouces

- https://github.com/mattrglobal/jsonld-signatures-bbs/tree/master
  - use for creating the VCs -> JSON-LD?
