# Decision Log

Append-only architectural decision records (ADRs), extracted by
`/apzumi-sync-knowledge` from a completed change's `design.md` →
`## Decisions & Trade-offs` blocks, just before that change is archived. Do not
hand-author entries here — write the decision in the change's `design.md` and
let the sync extract it, so the review gate audits it first.

This directory is invisible to the OpenSpec CLI (`openspec list`, `validate`,
`archive` only ever look for files named `spec.md`), so it never interferes
with spec discovery or validation.

---

## Index

<!-- Maintained by /apzumi-sync-knowledge. One row per ADR, ordered by number.
     This table is the ONLY part of this directory that is ever rewritten. -->

| # | Decision | Status | Capabilities | Change |
|---|---|---|---|---|
<!-- | [0001](0001-example-slug.md) | Example decision title | Accepted | billing | <change-name> | -->

---

## What earns an ADR

The bar is deliberately high — an ADR log that records every implementation
choice is one nobody reads. Write a `## Decisions & Trade-offs` block, and so
create an ADR, only when **all** of these hold:

- A real alternative existed and was rejected for a reason.
- The choice is expensive or disruptive to reverse later.
- Someone landing on this code in a year would otherwise ask "why on earth is
  it done this way?"

Routine choices — naming, file placement, which existing helper to reuse,
anything the codebase's conventions already dictate — belong in design.md's
`## Approach`, not here. If a change produces no ADR, that is a normal and
common outcome; it is not a gap to fill.

## Format

One file per decision: `openspec/decisions/NNNN-<slug>.md`, numbered
sequentially across the whole log (not per capability).

```markdown
# NNNN. <Title>

- **Status:** Accepted
- **Date:** YYYY-MM-DD
- **Change:** <change-name>
- **Capabilities:** <capability-path-1>, <capability-path-2>

## Context
<!-- The situation that forced a choice. -->

## Decision
<!-- What was chosen, stated plainly. -->

## Alternatives Considered
<!-- What else was on the table, and why it lost. -->

## Consequences
<!-- What this locks in or rules out later. -->
```

## Rules

- **Append-only.** An existing ADR's Context/Decision/Alternatives/Consequences
  are never edited after creation — they're a historical record of what was
  decided and why, not a living document.
- **The only permitted edit** to an existing ADR is flipping its `Status` line
  when a later decision supersedes it:
  `Status: Superseded by [0007](0007-slug.md)`. The superseding ADR carries a
  matching `Supersedes: 0003` line, and the index row is updated to match.
- Numbering is sequential and global — check the highest existing `NNNN`
  before assigning the next one. `scripts/apzumi-validate.mjs` fails on a
  duplicate or a gap.
- `Change:` records the change name only, not an archive path. The sync runs
  before archiving, so the archive date isn't known yet — find the source
  change under `openspec/changes/archive/*-<change-name>/`.
