# Tasks: <change name>

<!--
  Ordered, atomic, codebase-grounded. One task = one logical commit.
  Format:  <verb> `real/file/path` — <acceptance/verification>  [req: <Requirement name>]
  Inspect the modules named in design.md before finalising paths.
  Order by dependency: shared types -> models/migrations -> services -> API -> UI.
  Multi-platform changes: group under one heading per in-scope platform (exact
  names from the project context); shared/cross-cutting setup first.
  Two kinds of test task, labelled so they can't be confused:
    **[E2E automation]**  layer 1 — generated from tests.md by
      @apzumi-generate-test-code. First task under each platform, when tests.md
      has Regression rows. Expected to produce FAILING tests; the
      implementation tasks below it are what turn them green.
    **[Unit]** / **[Integration]**  layer 2 — hand-written, in the final group,
      from the spec scenarios and design.md. Only what E2E cannot reach.
  They must not overlap: if a layer-2 task asserts what an E2E test already
  asserts, drop it.
  NO manual QA execution tasks here — those live in tests.md.
  A task that CREATES a file names its registration/wiring step too.
  "implement"/"support"/"refactor" alone is not a task — say what changes.
-->

## 1. <group — e.g. Data model & migrations>
- [ ] 1.1 <verb> `path/to/file` — <acceptance>  [req: <requirement name>]

## 2. <platform — e.g. Frontend>
- [ ] 2.1 **[E2E automation]** Generate <framework> test code for the <platform> scenarios in tests.md — delegate to `@apzumi-generate-test-code`; covers <T1, T3> (Regression only). Done when the tests exist and run, failing because the feature is absent.
- [ ] 2.2 <verb> `path/to/file` — <acceptance>  [req: <requirement name>]

## 3. <group — e.g. API surface>
- [ ] 3.1 <verb> `path/to/file` — <acceptance>  [req: <requirement name>]

## 4. Unit & integration tests (white-box)
<!-- Layer 2 only. Not derived from tests.md — these come from the spec
     scenarios and design.md's Testing Strategy, and cover what the E2E tests
     above cannot reach. -->
- [ ] 4.1 **[Unit]** Test `path/to/file` — <edge case / boundary the E2E tests cannot observe>
- [ ] 4.2 **[Integration]** Test `path/to/file` — <internal interaction, e.g. resource handling>
