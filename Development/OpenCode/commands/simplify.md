---
description: Code Review and Cleanup
agent: build
---

# Simplify: Code Review and Cleanup

Review all changed files for reuse, quality, and efficiency. Fix any issues found.

## Phase 1: Identify Changes

Run `git diff` (or `git diff HEAD` if there are staged changes) to see what changed. If there are no git changes, review the most recently modified files that the user mentioned or that you edited earlier in this conversation.

## Phase 2: Launch Three Review Subagents in Parallel

Use the `explore` or `thread` subagent to launch all three subagents concurrently in a single message. Pass each subagent the full diff so it has the complete context.

### Subagent 1: Code Reuse Review

For each change:

1. **Search for existing utilities and helpers** that could replace newly written code. Look for similar patterns elsewhere in the codebase — common locations are utility directories, shared modules, and files adjacent to the changed ones.
2. **Flag any new function that duplicates existing functionality.** Suggest the existing function to use instead.
3. **Flag any inline logic that could use an existing utility** — hand-rolled string manipulation, manual path handling, custom environment checks, ad-hoc type guards, reimplemented sorting or filtering, and similar patterns are common candidates.

### Subagent 2: Code Quality Review

Review the same changes for hacky patterns:

1. **Redundant state**: variables or data structures that duplicate existing state, cached values that could be derived, observers or callbacks that could be direct calls
2. **Parameter sprawl**: adding new parameters to a function instead of generalizing or restructuring existing ones; consider grouping related parameters into a config object or struct
3. **Unjustified abstraction**: the same logic repeated three or more times with no meaningful variation — unify only if a shared abstraction would be simpler than each call site. Prefer duplication over a premature abstraction that requires flags or special cases to handle its callers
4. **Leaky abstractions**: exposing internal details that should be encapsulated, or breaking existing abstraction boundaries
5. **Stringly-typed code**: using raw strings where named constants, enums, or typed identifiers already exist in the codebase
6. **Unnecessary wrapper layers**: intermediate functions, classes, or modules that add no logic and merely delegate to something else — inline or remove them
7. **Unnecessary comments**: comments explaining WHAT the code does (well-named identifiers already do that), narrating the change, or referencing the task/caller — delete; keep only non-obvious WHY (hidden constraints, subtle invariants, workarounds)

### Subagent 3: Efficiency Review

Review the same changes for efficiency:

1. **Unnecessary work**: redundant computations, repeated file reads, duplicate network/API calls, N+1 query patterns
2. **Missed concurrency**: independent operations run sequentially when they could run in parallel (async tasks, goroutines, threads, subprocesses, etc.)
3. **Hot-path bloat**: new blocking work added to startup sequences or per-request/per-iteration critical paths
4. **Recurring no-op updates**: state or data structure updates inside polling loops, intervals, or event handlers that fire unconditionally — add a change-detection guard so downstream consumers aren't notified when nothing changed
5. **Unnecessary existence checks**: pre-checking file or resource existence before operating (TOCTOU anti-pattern) — operate directly and handle the error
6. **Memory**: unbounded data structures, missing cleanup, resource or listener leaks
7. **Overly broad operations**: reading entire files when only a portion is needed, loading all records when filtering for one, fetching full objects when only a subset of fields is used

## Phase 3: Fix Issues

Wait for all three subagents to complete. Aggregate their findings and fix each issue directly. If a finding is a false positive or not worth addressing, note it and move on — do not argue with the finding, just skip it.

When done, briefly summarize what was fixed (or confirm the code was already clean).
