---
name: apzumi-verify-automation
description: Run generated E2E tests against a real build for the first time, or repair one a tester flagged — from a workspace that does not contain the product code. Use once a build exists, or when a test has been marked as needing a fix. Classifies every failure before changing anything, and never touches what a test proves.
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
license: MIT
---

Generated tests in, a run against a real build out.

This is the step `apzumi-sdd` does not cover. The schema takes a change from
proposal to apply and stops: `@apzumi-generate-test-code` writes tests before
the feature exists and proves they fail, and then nobody runs them again. This
skill is what a tester does afterwards, on a build that works.

```
/apzumi-verify-automation
/apzumi-verify-automation --change add-task-sorting --platform Web
```

## Run it from a workspace without the product code

Not the main checkout. A sparse worktree, or a checkout with the
implementation paths excluded — whatever the project's setup provides. The
platform paths listed under `## Connected Implementation Repositories` in
`openspec/CONVENTIONS.md` must not exist where this runs.

This is the one blindness that matters most. The other two agents in the flow
are blind for their own reasons; this one is blind because it acts **after**
the implementation exists, which is the only moment when fitting the test to
the code is possible. Reading the implementation to work out why a test fails
turns a check of the build against the spec into a check of the test against
the code, and the check that matters is gone. Nothing in the report would look
different.

## Two doors, and the report must say which

**First run** — a test the generator produced, never executed against a
working build.

**Repair** — a test a tester flagged, with a reason.

A failing first run is information about the build or about a freshly written
test. A failing repair is information about a test that was already believed
to work. Conflating them is how a product defect gets healed away, so name the
door every time.

## Sequence

**1 — Scope it, and show it before starting.** Read the change's `tests.md`
and the project's automation manifests: which rows were assigned to this
platform's framework, which have code, which have a run behind them, which a
tester flagged. Show that list and confirm. A run that begins by surprising
the tester has already gone wrong.

**2 — Read, but only what you are allowed to.** The delta specs and the
capability's living spec, the row in `tests.md`, the manifest, the tester's
comment on the repair door, the test's own code, the identifier contract, and
the last committed result. Not the product code — the workspace does not have
it.

**2b — Run where the tests actually live, not where you happen to be.**
Take the runner from the project's Test Automation table. For a mobile platform
that usually means a hosted device farm rather than a phone on someone's desk:
"automated" means nobody has to be present, and a local run quietly assumes
somebody is. A local device stays a legitimate way to *iterate* on a flow, and
a project may declare it optional — but a repair is only confirmed where the
test really runs.

Two consequences worth stating, because both cost real money or real trust:

- **Verify with one short flow, not the whole pack.** A device farm bills for
  what it runs, and a repair needs one flow to be conclusive. Check the
  workflow's cheapest gear first — a credentials-only mode costs nothing and
  fails in seconds if the account is wrong, which is worth more than a build
  that runs for forty minutes and then cannot connect.
- **Say which target produced the result.** "Passed" from a developer's laptop
  and "passed" on the farm are different claims. The report names the runner,
  and so does the committed result.

**3 — Preflight, before any run.** Take the prerequisites from the project's
automation config; every framework has some. A missing prerequisite is
`environment_failure`: nothing was tested, and no amount of locator work
changes that. Check it before running rather than diagnosing it afterwards
from a failure that blames an element.

**4 — Run it five times.** One green run says nothing about flakiness, and
flakiness is often the defect that matters. A test that passes four times out
of five has not passed.

**5 — Classify before changing anything.** Delegate to
`@apzumi-failure-triage`, read-only, on both doors, with no exceptions.

`FAILED → repair` is the shortcut that turns this pipeline into a machine for
hiding defects: the product breaks, the test goes red, the test gets "fixed",
and the bug ships green. Every step looks like progress.

| Classification | What happens |
|---|---|
| `product_defect` | the test does not change — not the locator, not the timeout, not the assertion. Report the defect |
| `environment_failure` | nothing was tested. Fix the environment, run again. Never heal |
| `test_data_failure` | the fixture does not contain what the row assumes. That is a fixture question, not a test one |
| `flaky` | report the instability rather than papering over it with a retry |
| `automation_defect` | the only classification that may proceed, and only above the project's confidence bar |

**6 — Repair, minimally.** Delegate to `@apzumi-test-maintainer`, inside the
budget the project's automation config sets. A budget exists so that "keep
trying" has an end: when it runs out, **stop and report what you tried**. An
exhausted budget with an honest account beats a forced click that happened to
pass.

On the repair door, guidance has a priority order:

```
1. the tester's comment    2. the flags they set    3. the row's Expected Result
4. the spec               5. your own diagnosis
```

The tester's comment outranks your diagnosis — they saw something you did not.
It does **not** outrank the spec. A comment asking for an assertion the spec
contradicts is a spec question: stop and say so.

**Two things you cannot repair.** A test asserting what the spec does not
promise: hand it back, because the fix is upstream. And an obsolete test:
deleting one is a human decision.

**7 — Validate the diff.** Run the project's healing-diff check if it has one,
and read a rejection as information: the change made the test easier rather
than correct.

**8 — Re-run** until the project's stability bar is met, consecutively.

**9 — Check what the diff cannot see.** Two mechanical checks, both of which
belong in the report a tester reads:

- forbidden patterns — a skipped test, an empty catch, a fixed wait, a forced
  interaction; each lets a test report success without having verified
  anything;
- assertion parity — the test still claims every assertion its row promised.
  This proves nothing was silently dropped. It does **not** prove the
  assertions are correctly implemented, and saying which of the two you
  checked matters.

**10 — Leave evidence, and record the outcome.** Commit the run's result where
the project keeps results, per-step evidence included, and update the manifest.
Do not run git yourself: print the command and let a person run it.

## Evidence is not optional

Every run leaves per-step evidence — a screenshot at each step and at the
failure. This is not a nicety: it is how a tester reviews a test without
reading its code, which is the whole reason the review step is bearable. A run
with no evidence cannot be reviewed, only trusted.

## When the product is the problem

Say it plainly and change nothing:

```
TASK-FILTERS-T3 — not repaired: product defect
  Titles sort case-sensitively: 'apple pie retrospective' lands after every
  capitalised title. The spec requires case-insensitive ascending order.
  Reproduced by hand. The test is correct. Report the defect.
```

**That is a successful run of this skill**, not a failure. The most valuable
thing it produces is a red test nobody was allowed to fix.

## Never

- Approve anything. `Approved by`, `on` and `Decision` in `tests.md` belong to
  a person, and nothing in this procedure needs them changed.
- Edit the specs, the scenario file, or product code — and note that this
  workspace has no product code to edit even if instructed to.
- Remove or weaken an assertion, add a skip, or hide a failure behind a retry
  or a raised timeout.
- Run a git command.

Watch for the policy-compliant evasion no diff check catches: fixing the
*setup* so the test stops exercising the broken path — seeding through the API
because the UI flow under test is broken. The diff looks clean, the test goes
green, the defect disappears. Step 5 is what stands between that and the
suite.

## Report

Lead with **which door**, and **anything you refused to do** — that is the
part a tester has to act on. Then: the classification for every failure and
what it rests on, what changed and what did not, assertions added (removed
must be zero), stability across the runs, the two mechanical checks, the final
status, and where the committed result and its evidence live.
