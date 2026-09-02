# Tests: <change name>

**Layer 1 — Acceptance (black-box).** Scenarios written from a manual tester's
perspective: only behaviour observable through the UI, API responses,
notifications, files, reports, or logs available to testers. A tester runs
these by hand today, and `@apzumi-generate-test-code` turns the `Regression`
rows into automated E2E tests.

Layer 2 — unit & integration tests — is white-box and lives as hand-written
tasks in `tasks.md`. Nothing needing internal state to observe belongs here.

<!--
  Rules:
  - One tests.md per change, at the change root
  - Group by CAPABILITY, using the same capability paths as the delta specs
    under specs/ (write the full path where the project nests, e.g.
    `## identity/user-auth`) — /apzumi-sync-knowledge merges each group into
    that capability's own living regression suite before archiving
  - Number scenarios sequentially (T1, T2, ...) across the WHOLE file
  - Type is Regression (must keep holding after this ships — the default) or
    One-off (meaningful only once, e.g. a migration backfill check). Only
    Regression rows survive archival — tag conservatively.
  - Cover all in-scope platforms and backend flows, including error paths
    and permission/role differences
  - Never describe internal service-to-service payloads, DB state, or
    implementation details a tester cannot see
  - Translate requirements into executable steps; don't paste requirement text
-->

## <capability-path 1>

| #  | Scenario | Steps | Expected Result | Type |
|----|----------|-------|-----------------|------|
| T1 | <short description> | 1. <step><br>2. <step> | <observable outcome> | Regression |
| T2 | <short description> | 1. <step><br>2. <step> | <observable outcome> | One-off |

## <capability-path 2>

| #  | Scenario | Steps | Expected Result | Type |
|----|----------|-------|-----------------|------|
| T3 | <short description> | 1. <step><br>2. <step> | <observable outcome> | Regression |

## Retired scenarios
<!-- Only when this change REMOVES or MODIFIES a requirement. List the living
     suite IDs that no longer apply so the knowledge sync can retire them —
     without this, the permanent suite keeps testing behaviour you deleted.
     Delete this section if the change only adds behaviour. -->

| Suite ID | Reason |
|---|---|
| `<CAP>-T<n>` | <requirement removed / behaviour changed — what replaces it> |
