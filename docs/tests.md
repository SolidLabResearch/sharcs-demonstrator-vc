# Tests

## Selective disclosure tests

**Selective disclosure tests with one input VC.**

<!-- Diploma credential -->
- [`vc1-sd-001a`](../__tests__/__fixtures__/selective-disclosure/vc1-sd-001a.json).
Disclosed diploma attributes:
  - `id`
  - `holder`
  - `title`
  - `degreeName`
  - `degreeLevel`
  - `degreeMajor`
  - `degreeMinor`
  - `graduationDate`
  - `gradePointAverage`
- [`vc1-sd-001b`](../__tests__/__fixtures__/selective-disclosure/vc1-sd-001b.json).
Disclosed diploma attributes:
  - `id`
  - `holder`
  - `title`
  - `awardingInstitution`
- [`vc1-sd-001c`](../__tests__/__fixtures__/selective-disclosure/vc1-sd-001c.json).
Disclosed diploma attributes:
  - `id`
  - `holder`
  - `title`
<!-- Identity credential -->
- [`vc2-sd-001a`](../__tests__/__fixtures__/selective-disclosure/vc2-sd-001a.json): Selectively discloses the credential subject's `id`.
- [`vc2-sd-001b`](../__tests__/__fixtures__/selective-disclosure/vc2-sd-001b.json): Selectively discloses the `id` of the credential subject and its home location.
- [`vc2-sd-001c`](../__tests__/__fixtures__/selective-disclosure/vc2-sd-001b.json): Selectively discloses the credential subject's `id`, given name, and family name.
- `Combined: vc2-sd-001a and vc2-sd-001b`: Two different disclosure documents (
  [`vc2-sd-001a`](../__tests__/__fixtures__/selective-disclosure/vc2-sd-001a.json)
  and [`vc2-sd-001b`](../__tests__/__fixtures__/selective-disclosure/vc2-sd-001b.json))
  are applied to the same VC, [`vc2`](../__tests__/__fixtures__/vc/vc2.json).

**Selective disclosure tests with multiple VCs.**
<!-- Tests with multiple credentials -->

- `Combined: vc1-sd-001b and vc2-sd-001b`: Two different input VCs and different disclosure documents.
  The resulting VP contains two derived VCs, i.e.:
  - A minimized diploma credential, only disclosing the diploma's `id`, `holder`, `title`, and `awardingInstitution`.
  - A minimized identity credential, only disclosing the identity's `id` and `homeLocation`.

## Range query tests

- [ ] Document range query tests

## Combined SD + RQ tests

- `Combined SD + RQ: vc1-sd-001b & vc2-rq-001`: Two different input VCs and different derivations.
  The resulting VP contains two derived VCs, i.e.:
  - A minimized diploma credential, only disclosing the diploma's `id`, `holder`, `title`, and `awardingInstitution`.
  - A minimized identity credential with a range query proof for proving that the home location's `maximumAttendeeCapacity` is *less than* 50000.

## End-to-end tests

> Tests can found in [`__tests__/e2e/index.test.js`](../__tests__/e2e/index.test.js).

The end-to-end scenarios are as follows:

- Register - sign - resolve - verify
  - Issuer registers its public key material at the registry.
  - Issuer signs VC.
  - Verifier verifies the latter VC.
    To do so, the issuer's keypair needs to be resolved from the registry  for each proof.

- Register - sign - derive (RQ|SD) - resolve - verify
  - Issuer registers its public key material at the registry.
  - Issuer signs VC.
  - Holder derives VC, resulting in a VP. Depending on the kind of derivation (i.e., range query or selective disclosure), different parameters are required.
    - Range-query derivation requires a disclosure document, and predicates.
    - Selective-disclosure derivation requires only a disclosure document.
  - Verifier verifies the latter VC.
    To do so, the issuer's keypair needs to be resolved from the registry  for each proof.
