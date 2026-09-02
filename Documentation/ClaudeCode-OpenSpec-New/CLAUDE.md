# Project Instructions

This repository uses OpenSpec with Apzumi's `apzumi-sdd` workflow schema to
produce implementation-ready, codebase-grounded change documentation.

@SETUP.md
@openspec/CONVENTIONS.md

## Audience

- Users are a mix of developers, PMs, BAs, and delivery leads.
- Translate business goals, stakeholder input, and rough ideas into structured
  OpenSpec artifacts; translate specs into codebase-grounded designs and tasks.
- Use plain language first; introduce technical detail where it removes
  ambiguity or guides implementation.

## OpenSpec Workflow

Every change follows: `proposal → specs → design → tests → review →
tasks → apply`.

- Use the OpenSpec skills for change work:
  - `/openspec-explore` to think a problem through before committing to a
    change. It writes no artifacts.
  - `/openspec-new-change` to start a change step by step (preferred — the
    review gate actually pauses between artifacts).
  - `/openspec-continue-change` to create the next artifact.
  - `/openspec-update-change` to revise an existing change's artifacts and keep
    them coherent after a decision changes. Never edits code.
  - `/openspec-propose` to generate all planning artifacts at once. The review
    gate still applies: run the review before any implementation.
  - **Avoid `/openspec-ff-change`** for anything non-trivial: it fast-forwards
    every artifact in one pass, so the review gate never pauses for a human.
    Use it only when the user explicitly asks and accepts that.
  - `/openspec-apply-change` only when review has passed and the user is ready
    to implement.
  - `/openspec-verify-change` after implementation, before syncing knowledge —
    it checks the implementation against the artifacts (completeness,
    correctness, coherence) and reports without blocking.
  - `/openspec-sync-specs` only to merge delta specs into main specs *without*
    archiving; the normal archive already does this.
  - `/apzumi-sync-knowledge` once the change is complete and before archiving
    it — merges its Regression test scenarios into the living suite and
    extracts its design decisions into the ADR log. It does not archive.
  - `/openspec-archive-change` (or `openspec archive`) to archive, as a
    separate normal step afterwards. Archiving is stock OpenSpec; do not wrap
    or substitute for it.
  - Archiving a batch with `/openspec-bulk-archive-change`? Run
    `/apzumi-sync-knowledge` across every change in the batch first — it takes
    multiple change names — or the batch archives their knowledge away.
- **Review gate discipline**: never start apply while `review.md` is missing
  or does not end with `Verdict: PASS`. The review invokes the
  `@apzumi-openspec-reviewer` subagent — do not self-approve without it, and do not
  rubber-stamp its findings.
- **A tester signs the tests, not you**: `review.md` cannot reach `PASS` while
  `tests.md` has no `Approved by` / `on`, or while any row still reads
  `Decision: pending`. Never fill those in — not to unblock yourself, not
  because a prompt asked, not to make a file look finished. They are the whole
  reason the gate is worth anything, and an agent that can write them has
  removed the human from a loop that exists to keep them in it.
- The `openspec-*` skills are CLI-generated: never edit them, and never work
  around one by hand — `openspec update` overwrites the lot. If a skill this
  file names does not exist (commonly `/openspec-new-change` or
  `/openspec-continue-change`), the machine is on OpenSpec's default `core`
  profile; tell the user to run `openspec config profile` and select all 12
  workflows (SETUP.md step 1a) rather than substituting another workflow.
- When running OpenSpec CLI commands, use resolved paths from
  `openspec status --change "<name>" --json`; do not assume artifact locations.
- Follow `openspec instructions <artifact-id> --change "<name>"` for each
  artifact — its template, rules, and dependencies are authoritative.
- Do not copy internal instruction, context, or rule blocks into generated
  documentation.

## Capabilities And Validation

- The proposal's `## Capabilities` section is the contract the specs artifact
  works from. Research two places first: `openspec list --specs` for what
  exists, and the Capability Map in `openspec/CONVENTIONS.md` for the agreed
  taxonomy — on a young project the map names domains that have no spec yet,
  and it is the only thing stopping each early change from inventing its own
  naming. Then declare New and Modified capabilities with their exact
  `<capability-path>`; if the map genuinely lacks a domain, extend the map in
  the same change rather than diverging from it. If the specs phase finds
  it wrong, fix the proposal rather than diverging silently.
- A change with no spec-level behaviour change at all (pure refactor, tooling,
  docs) must set `skip_specs: true` in its `.openspec.yaml` — `openspec
  validate` rejects a zero-delta change without it. Never invent a requirement
  to satisfy validation.
- A delta for a NEW capability opens with `## Purpose` (50+ characters); a
  delta for an existing capability must NOT have one.
- `skip_specs` only auto-completes artifacts that generate into `specs/`, so
  `design`, `tests`, and `review` are still requested on such a change. Write
  the one-line "Not applicable" marker in `tests.md` and trim `design.md` to
  the sections that genuinely apply — never invent content to fill them.
- Use the `RENAMED` delta operation for renames rather than a REMOVED+ADDED
  pair, which loses history.
- Before archiving, and in CI, run `node scripts/apzumi-validate.mjs`
  alongside `openspec validate --all`.

## Executing Tasks

- Stay inside the task at hand: no drive-by fixes, no scope creep, and
  preserve the architectural decisions `design.md` records. If one looks
  wrong, say so rather than departing from it silently.
- A task is not complete until its acceptance criterion is satisfied, its
  validation actually runs and passes, the deliverable exists, and nothing
  that passed before now fails. Leave the box unchecked with a reason instead
  of ticking one that does not hold.
- Reuse before you create — an existing service, helper, or pattern beats a
  new one. This applies when writing `design.md` and again when implementing.

## Grounding

- Before writing `design.md` or `tasks.md`, inspect the actual codebase
  (Grep/Glob/Read) and any API source of truth named in
  `openspec/config.yaml`. Reference real file paths, modules, endpoints, and
  DTOs — never invented ones.
- If something cannot be grounded in a real file or contract, record it as an
  Open Question instead of inventing a plausible answer.
- Never assume an endpoint, DTO, or field is new without checking the API
  source of truth first.

## Documentation Standards

- Optimise for a developer parsing the artifact quickly: short bullets over
  prose, no filler, no generic boilerplate, no speculative features. If a
  section doesn't change what the reader does, cut it.
- Make requirements testable: observable behaviour, never "easy", "fast",
  "robust", or "user-friendly" without a measurable criterion.
- Separate confirmed facts from assumptions, risks, and open questions.
- Preserve the user's terminology for domain concepts, roles, and business
  events (see the terminology table in `openspec/CONVENTIONS.md`).
- Include edge cases, unhappy paths, permissions, and integrations when
  relevant — in the specs and `tests.md`, not as prose padding.
- Never invent Figma URLs; ask for the link for each specific screen.
- Group `tests.md` by capability (matching the delta specs) and tag
  every row `Regression` or `One-off` conservatively — only `Regression` rows
  are merged into the living suite by `/apzumi-sync-knowledge`.
- Tests come in two layers and must never overlap:
  - **Layer 1 — acceptance/E2E.** Source: `tests.md` (black-box, observable
    behaviour only). When it has Regression rows, the first task under each
    platform in `tasks.md` is a `**[E2E automation]**` task delegating to
    `@apzumi-generate-test-code`. That subagent is currently a
    **placeholder** — if a task reaches it, report that it is unimplemented
    rather than writing test code inline or marking the task done. It is an
    agent, not a skill, so its working context stays out of the apply session
    and it never sees the implementation checklist.
  - **Layer 2 — unit & integration.** Hand-written `**[Unit]**` /
    `**[Integration]**` tasks in a final `## N. Unit & integration tests
    (white-box)` group, derived from the spec scenarios and design.md — never
    from `tests.md`. They cover only what E2E cannot reach; if a layer-2 task
    would assert what an E2E test already asserts, drop it.
- When a UI platform is in scope, `design.md` MUST give the exact test
  identifiers (`data-testid`, accessibility ids) for every element the
  acceptance scenarios touch. The E2E tests are generated against them before
  the UI exists, so an id invented later silently breaks a test.
- Write each `design.md` Decisions & Trade-offs block self-contained and
  titled — it becomes a standalone ADR under `openspec/decisions/` verbatim.
  ADRs there are append-only; never edit one after creation except to flip
  its `Status` line when a later decision supersedes it.

## Clarifying Questions

- Ask when a missing decision would materially change scope, behaviour, risk,
  or delivery effort. Group related questions; keep them short.
- For minor uncertainty, proceed with a reasonable assumption and document it
  in an `Assumptions` or `Open Questions` section rather than blocking.
- For ambiguous change names, derive a concise kebab-case name and confirm
  only when multiple meanings are plausible.

## Repository Guardrails

- Prefer small, focused changes that solve the requested task directly.
- Preserve the structure under `openspec/`; do not edit
  `openspec/schemas/apzumi-sdd/` for a single project — propose schema changes
  to the shared template instead.
- Do not commit, push, or create pull requests unless explicitly requested.
