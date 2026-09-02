---
name: apzumi-generate-test-code
description: "PLACEHOLDER — NOT YET IMPLEMENTED. Intended to generate automated acceptance/E2E test code (Playwright, Maestro, or the project's framework) from a change's tests.md Regression scenarios, and confirm it fails because the feature is absent. tasks.md delegates to it as the first task under each platform; invoking it today reports that it is unimplemented and stops."
tools: Read, Glob, Grep, Write, Edit, Bash
model: inherit
---

# NOT YET IMPLEMENTED

**Stop and report that this agent is a placeholder.** Do not generate test
code, do not improvise an implementation, and do not let the calling task be
marked complete. Say which change and platform you were asked to generate for,
and that someone must implement this agent first.

The `apzumi-sdd` schema tells `tasks.md` to make test-code generation the first
task under each platform, delegated here. That reference is deliberate: the
placeholder exists so the workflow is already shaped for it, and filling it in
is a self-contained job that needs no change to the schema.

---

## Why this is an agent and not a skill

Two structural reasons, worth preserving when you implement it:

- **Context isolation.** Generating a suite means reading tests.md, design.md,
  the delta specs, and enough of the project's existing tests to match its
  conventions. As a skill, every one of those tokens would stay in the apply
  session and pollute the implementation that follows. Here they are spent in
  this agent's own window, and only the report comes back.
- **Scope confinement.** The standing risk is an agent "helpfully" stubbing the
  feature or weakening an assertion to get a green run. This agent never sees
  the implementation checklist — its entire brief is to write tests and prove
  they fail for the right reason.

It runs on the session's model (`model: inherit`) rather than a pinned tier:
this is ordinary code-writing, not the independent-angle review the
`apzumi-openspec-reviewer` needs.

---

## Contract for whoever implements this

**Inputs** (the calling task names them):
- The change name — artifacts live at `openspec/changes/<name>/`.
- The platform, using the project's exact platform name from
  `openspec/CONVENTIONS.md`.
- The T-numbers to cover, from that change's `tests.md`.
- The framework, from the project context in `openspec/config.yaml`
  (e.g. Playwright for web, Maestro for mobile).

**What to read**
- `openspec/changes/<name>/tests.md` — layer 1, the acceptance scenarios. They
  are grouped by capability, not platform, so map them to the requested
  platform.
- `openspec/changes/<name>/design.md` — `## Test Identifiers` gives the exact
  `data-testid` / accessibility ids the tests must target, and the real routes
  and file paths. If an identifier a scenario needs is missing there, stop and
  report it; do not invent one, because the implementer will choose a different
  string and the test will break.
- The delta specs under `openspec/changes/<name>/specs/` — the requirement each
  scenario traces to.
- The project's existing tests, to match their structure and conventions.

**Rules**
- Generate from `Regression` rows only. `One-off` rows are one-time checks and
  must never become permanent automated tests.
- Layer 1 only. `tests.md` is externally observable behaviour, so produce
  end-to-end/UI-level tests and nothing deeper. Unit and integration tests are
  layer 2 — ordinary hand-written tasks in `tasks.md`, not your concern.
- The generated tests are expected to FAIL, because the feature does not exist
  yet. That is success for this step. **Never** weaken a test, relax an
  assertion, or stub the feature to get a green run, and never touch
  application code — you write tests, nothing else.
- Name test files and cases so a scenario is traceable both ways: the T-number
  from the change, and the requirement it satisfies.
- Write tests where the project already keeps them (see `Testing:` in the
  project context); do not invent a new test-root convention.
- If a scenario cannot be automated, skip it and report why. Do not emit a
  placeholder or skipped test that later reads as coverage.

**Verify before reporting**
Run the suite with the project's own test command and confirm each new test
fails *because the feature is absent* — not because it fails to compile, the
selector syntax is wrong, or the harness is misconfigured. A test that errors
before it reaches its assertion has not been verified.

**Output**
Report the files written, the T-numbers covered, any scenario skipped and why,
the command you ran, and the observed failure reason for each test.

---

## If you rename this agent

`openspec/schemas/apzumi-sdd/schema.yaml` names it in the `tasks` instruction,
and `openspec/schemas/apzumi-sdd/templates/tasks.md` shows it in the example
task. `scripts/apzumi-validate.mjs` checks the `[E2E automation]` label rather
than the agent name, so it is unaffected. Update the first two, or generated
task lists will point at an agent that does not exist.
