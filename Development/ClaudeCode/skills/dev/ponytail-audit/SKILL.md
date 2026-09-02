---
name: ponytail-audit
description: >
  Whole-repo audit for over-engineering — scans the entire codebase instead of
  a diff and produces a ranked list of what to delete, simplify, or replace
  with stdlib/native equivalents. Use when the user says "audit this
  codebase," "audit for over-engineering," "what can I delete from this
  repo," "find bloat," or "ponytail-audit." One-shot report only — does not
  apply fixes.
disable-model-invocation: true
---

Same idea as `ponytail-review`, but repo-wide: scan the whole tree instead of a diff. Rank findings biggest cut first.

## Format

`<tag> <what to cut>. <replacement>. [path]`

Tags:

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

## Hunt

Dependencies the stdlib or platform already ships, single-implementation interfaces, factories with one product, wrappers that only delegate, files exporting one thing, dead flags and config, hand-rolled stdlib.

## Output

One line per finding, ranked biggest cut first. End with `net: -<N> lines, -<M> deps possible.` Nothing to cut: `Lean already. Ship.`

## Boundaries

Scope: over-engineering and complexity only. Correctness bugs, security holes, and performance are explicitly out of scope — route them to a normal review pass, not this one. A single smoke test or `assert`-based self-check is the ponytail minimum, never flag it for deletion. Lists findings, applies nothing. One-shot.
"stop ponytail-audit" or "normal mode": revert.
