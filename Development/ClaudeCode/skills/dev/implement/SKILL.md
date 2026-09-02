---
name: implement
description: Implement a piece of work based on a spec or set of tickets under `.scratch/`. Use to build the agreed feature test-first, then review it. Follows the grill → to-spec → to-tickets → implement → full-code-review workflow.
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets (typically under `.scratch/<feature-slug>/`). Use the project's `docs/glossary.md` vocabulary and respect ADRs in `docs/adr/`.

## Pick the work

If the user names a ticket, work that one. Given only a feature directory, work the frontier: the lowest-numbered ticket whose `Status` is `ready-for-agent` and whose blockers are all `done`. Read the ticket's `Spec:` reference for full context — the conversation that produced these files is gone.

## Build

Use `/tdd` where possible, at the seams recorded in the spec's Testing Decisions.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

## Verify before marking done

Before ticking anything, pass this gate:

- Re-read the diff — you can explain what every changed line does.
- Every acceptance criterion is met exactly, not approximately.
- Typecheck and the relevant tests pass.

Then tick the ticket's acceptance checkboxes and flip `Status: ready-for-agent` to `Status: done`. If the ticket still fails after one retry, set `Status: blocked — <one-line reason>` and move to the next frontier ticket. Never silently skip or half-tick a ticket.

## Review and hand off

Once done, use `/full-code-review` to review the work. That skill only reports — acting on its findings is your job, not the user's:

- **Critical** findings must be fixed. If one turns out to be a spec problem rather than a code problem, say so and stop instead of guessing.
- **Reuse**, **Improvements**, and **Convention** findings: apply the ones that are worth the diff, skip the rest and say in one line why.
- Nitpicks are optional.

Re-run the verify gate above after fixing — one review pass is enough, don't run the review again. Report which findings you fixed and which you deliberately left.

Never commit on your own. Summarize the change set, show the Conventional Commits message you would use, and ask whether to commit it. Only on an explicit yes, commit it following the `git-workflow` skill.
