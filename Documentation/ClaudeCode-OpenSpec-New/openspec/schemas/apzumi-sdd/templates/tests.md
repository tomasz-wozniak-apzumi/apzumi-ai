# Tests: <change name>

**Approved by:** **on:**

**Layer 1 — Acceptance (black-box).** Scenarios written from a manual tester's
perspective: only behaviour observable through the UI, API responses,
notifications, files, reports, or logs available to testers. A tester runs
these by hand today, and `@apzumi-generate-test-code` turns the rows a tester
assigned to a framework into automated E2E tests.

Layer 2 — unit & integration tests — is white-box and lives as hand-written
tasks in `tasks.md`. Nothing needing internal state to observe belongs here.

Approval is **file-level**: filling `Approved by` and `on` above approves every
row below, so read them all first. Until both are filled, `review.md` cannot
record `Verdict: PASS`, and without that there is no `tasks.md` and no
implementation.

<!--
  Rules:
  - One tests.md per change, at the change root
  - Group by CAPABILITY, using the same capability paths as the delta specs
    under specs/ (write the full path where the project nests, e.g.
    `## identity/user-auth`) — /apzumi-sync-knowledge merges each group into
    that capability's own living regression suite before archiving
  - Number scenarios sequentially (T1, T2, ...) across the WHOLE file
  - Cover all in-scope platforms and backend flows, including error paths
    and permission/role differences
  - Never describe internal service-to-service payloads, DB state, or
    implementation details a tester cannot see
  - Translate requirements into executable steps; don't paste requirement text

  Columns, and who owns each:

    #                T<n>, sequential across the whole file. The knowledge sync
                     records it as the living suite row's Origin, so a malformed
                     id breaks traceability.

    Scenario         Short description, then the requirement it comes from as
                     `[req: <requirement name>]`. A row the agent proposed that
                     NO requirement asks for carries `[req: —]` — the absence
                     is the signal, and those rows are the ones a tester must
                     read hardest. Either the spec should promise it, or the
                     row should go.

    Steps            `1. ...<br>2. ...`. Preconditions are step 1, not a
                     separate field.

    Expected Result  What a tester can observe. This is the business assertion:
                     "no session is created", not "the POST returns 401".

    Type             `Regression` (must keep holding after this ships — the
                     default) or `One-off` (meaningful only once, e.g. a
                     migration backfill check). ONLY Regression rows survive
                     archival, so mistagging a durable check as One-off
                     silently drops it from the permanent suite. Tag
                     conservatively.

    Platforms        Verbatim from the platform table in
                     openspec/CONVENTIONS.md. This is the bridge between this
                     file and tasks.md: tests.md groups by capability, tasks.md
                     groups by platform, and this cell is what tells the
                     generation task under platform P which rows are its own.

    Automation       The agent's RECOMMENDATION, never a decision:
                       automation_candidate    deterministic, observable, cheap
                       manual_only             needs human judgement, a physical
                                               device, or visual assessment
                       needs_human_decision    genuinely unclear, or blocked on
                                               something nobody has answered
                     A recommendation nobody can act on is worse than none:
                     say WHY in the notes section when it is not obvious.

    Decision         HUMAN ONLY. The agent writes `pending` here and nothing
                     else, ever. Values: a framework the project configures
                     (`playwright`, `maestro`, ...), `manual`, or `pending`.
                     A row covering more than one platform takes a decision
                     PER PLATFORM, because "automate on Web, do it by hand on
                     Android" is a normal answer that one value cannot express:

                       playwright                                 one platform
                       Web: playwright · Mobile Android: manual   two

  The agent NEVER writes: `Approved by`, `on`, or any `Decision` other than
  `pending`. Those four are a person's, and a signature does not survive a
  change to content the signer never read — if a row's text changes after
  approval, the approval is cleared and said out loud.
-->

## <capability-path 1>

| #  | Scenario | Steps | Expected Result | Type | Platforms | Automation | Decision |
|----|----------|-------|-----------------|------|-----------|------------|----------|
| T1 | <short description> [req: <requirement name>] | 1. <step><br>2. <step> | <observable outcome> | Regression | <Platform> | automation_candidate | pending |
| T2 | <short description> [req: <requirement name>] | 1. <step> | <observable outcome> | One-off | <Platform> | manual_only | pending |

## <capability-path 2>

| #  | Scenario | Steps | Expected Result | Type | Platforms | Automation | Decision |
|----|----------|-------|-----------------|------|-----------|------------|----------|
| T3 | <short description> [req: —] | 1. <step> | <observable outcome> | Regression | <Platform> | needs_human_decision | pending |

### Notes for the reviewer
<!-- Optional, and worth its place only when a row needs explaining: why a
     recommendation is `needs_human_decision`, what a `[req: —]` row assumes,
     what a One-off tag rests on. This is what a tester reads before signing,
     so write the doubt down rather than leaving it in the agent's head.
     Delete this section when every row speaks for itself. -->

## Retired scenarios
<!-- Only when this change REMOVES or MODIFIES a requirement. List the living
     suite IDs that no longer apply so the knowledge sync can retire them —
     without this, the permanent suite keeps testing behaviour you deleted.
     Delete this section if the change only adds behaviour. -->

| Suite ID | Reason |
|---|---|
| `<CAP>-T<n>` | <requirement removed / behaviour changed — what replaces it> |
