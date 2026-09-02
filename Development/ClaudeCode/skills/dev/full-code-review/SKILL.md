---
name: full-code-review
description: >
  Professional code review of local changes, remote Pull Requests (by ID or
  URL), or the changes made during the current session. Checks correctness,
  security, reuse, efficiency, and adherence to project conventions; verifies
  findings before reporting and fans out to parallel subagent reviewers for
  large diffs. Use it when asked to review code, changes, diffs, or a PR.
context: fork
background: false
---

# Code Reviewer

This skill guides the agent in conducting professional and thorough code reviews for both local development and remote Pull Requests.

## Workflow

### 1. Determine Review Target

- **Remote PR**: If the user provides a PR number or URL (e.g., "Review PR #123"), target that remote PR.
- **Local Changes**: If no specific PR is mentioned, or if the user asks to "review my changes", target the current local file system states (staged and unstaged changes).
- **Session Changes (auto-triggered)**: If this skill was invoked automatically at the end of a session (e.g. by a hook, without an explicit user request), target the changes made during this session. The intended behavior is the task the user gave in the conversation — take it from there, don't ask. Run the whole review non-interactively: skip every "ask the user" step in this workflow and simply present the results.
- **In every case**: before reading any code, write down the intended behavior of the change in one or two sentences — from the PR description, linked ticket, commit messages, or the user's request. The first question of the whole review is whether the diff actually delivers this behavior; report gaps as **Critical** findings. If the intent is genuinely unclear, ask the user instead of guessing.
- **Spec-driven work**: if the change was built from a spec (a `.scratch/<feature-slug>/spec.md` with tickets, or a spec the user points at), read the spec and the tickets it produced — they are the authoritative statement of intent and enable the **Spec Conformance** pillar in Step 4.

### 2. Preparation

#### For Remote PRs:

1.  **Check for local work first**: Run `git status`. If there are uncommitted changes, stash them (`git stash`) before checking out the PR so they aren't lost or mixed into the diff you're about to review. Remember to restore them in the Cleanup step.
2.  **Checkout**: Use the GitHub CLI to checkout the PR.
    ```bash
    gh pr checkout <PR_NUMBER>
    ```
3.  **Preflight**: Don't assume a specific command. Look for a project verification step — check `package.json` scripts, `Makefile`/`Justfile` targets, or CI config (e.g. `.github/workflows/`) — and run whatever is actually defined (e.g., `npm test`, `npm run preflight`, `make test`, `make lint`). If nothing like this exists, skip the step and note in your review that no automated verification was found.
4.  **Context**: Read the PR description and any existing comments to understand the goal and history (`gh pr view <PR_NUMBER>`).

#### For Local Changes:

1.  **Identify Changes**:
    - Check status: `git status`
    - Read diffs: `git diff` (working tree) and/or `git diff --staged` (staged).
2.  **Preflight (Optional)**: If the changes are substantial, ask the user if they want to run the project's verification command first — use the same detection approach as above (don't hardcode a single tool/command).

### 3. Project Conventions Check

Before diving into the code analysis, inspect what conventions and standards the project defines. This step ensures that feedback is grounded in the actual rules of the project, not just general best practices.

#### 3a. Load Project Skills

Do not assume you already know the project's conventions. Check the list of available skills and **read every skill relevant to the changed files** — skills describing component patterns, testing rules, API conventions, naming standards, or architecture decisions (whether they live in `.claude/skills/`, come from plugins, or appear in the available-skills list). Their rules are binding project conventions, equal in authority to this skill. A Convention finding that contradicts a project skill is wrong; a convention violation missed because the skill wasn't read is a failed review step.

#### 3b. Scan Project Config and Docs

Also look for convention signals directly in the repository:

- **Agent instruction files**: `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.github/copilot-instructions.md`.
- **Linter/formatter configs**: `.eslintrc*`, `.prettierrc*`, `pyproject.toml`, `.flake8`, `rubocop.yml`, etc.
- **Style guides**: `CONTRIBUTING.md`, `docs/style-guide.md`, `docs/conventions.md`, or similar files.
- **Architecture docs**: `docs/architecture.md`, `ADR/` folders, `ARCHITECTURE.md`.
- **Test conventions**: Look at existing test files to understand naming patterns, structure, and tooling used.
- **Git conventions**: `.gitmessage`, commit history style, branch naming.

#### 3c. Apply Conventions in Review

Use everything found in 3a and 3b as a checklist during the In-Depth Analysis phase. Flag any deviations from project conventions explicitly in the findings, tagging them clearly as **Convention** issues so they're easy to distinguish from general code quality concerns.

If no conventions are found, note this briefly and fall back to widely accepted best practices for the language/framework in use.

### 4. In-Depth Analysis

#### Scaling the Analysis

**Measure the diff before you read it.** Run `git diff --stat` (local) or `gh pr diff <PR_NUMBER> --patch | diffstat` (remote), then subtract generated files, lockfiles, snapshots, and vendored code — 600 lines of `package-lock.json` is not a large diff. Write down two numbers: **hand-written added lines**, and changed files. Count additions rather than total churn: a rename or a pure code move can post a huge diffstat with almost no review surface, and deleted lines are already covered by the Correctness pillar's invariant check.

Those two numbers decide how the analysis runs. Nothing else does — in particular, **not** your sense of whether you already understand the change. You will almost always feel you can review it inline, because you have just read it; that feeling is not evidence and does not lower the thresholds below.

- **Under 300 hand-written added lines AND fewer than 8 changed files**: analyze everything yourself, inline.
- **300+ hand-written added lines OR 8+ changed files**: you **must** launch the parallel review subagents below. File count is the stronger signal of the two — review attention degrades with the number of distinct contexts you have to hold, not with raw line count, so a change scattered across many modules fans out even when it is small. Invoking this skill _is_ the user's request for that fan-out — so do not skip it to conserve tokens or subagent calls, and do not substitute a careful inline read. Laziness and minimal-diff heuristics govern the code you _write_, never the breadth of a review: three concurrent reviewers cost far less than one missed Critical finding. If you find yourself reasoning toward inline review on a diff above these thresholds, that reasoning is the failure mode this step exists to prevent.

  Launch them all in a single message so they run concurrently. Use the `Explore` subagent type — these reviewers only read and report, never modify code. Give each one the full diff, the intended behavior from Step 1, a summary of the conventions found in Step 3, and the ground rules below, plus one slice of the pillars:
  1. **Correctness & Safety reviewer**: Correctness, Spec Conformance (when a spec exists), Edge Cases and Error Handling, Security.
  2. **Reuse & Conventions reviewer**: Reuse and Project Conventions — this one must search the repository, not just read the diff.
  3. **Design & Efficiency reviewer**: Maintainability, Readability, Efficiency, Testability.

  Each subagent returns raw findings as `file:line — summary — why it matters / concrete failure scenario`. Instruct them not to self-censor: a half-believed candidate with a nameable failure scenario should be passed through — Step 5 is where filtering happens, and finders that silently drop candidates are the main cause of missed bugs. Aggregate and deduplicate their findings, then verify them yourself in Step 5.

- **Very large diffs** (1500+ hand-written added lines or 20+ changed files): fan out as above, and additionally record the full changed-file list (`git diff --name-only`) up front and check it off as you or your subagents cover each file. Before writing the summary, verify every changed file was actually considered — silently skipped files are the classic large-diff failure.

#### Ground Rules

Two rules apply to the whole analysis, inline or delegated:

- **Review the change, not the repo.** Flag issues only in code the diff touches — modified lines and the functions containing them. Serious pre-existing problems you happen to notice go into a single brief aside, not into the findings.
- **Never review the diff in isolation.** For each hunk, read the enclosing function or module — bugs in unchanged lines of a touched function are in scope, because the change re-exposes them. For each changed function signature or behavior, search for its callers and check the change doesn't break a call site (new precondition, changed return shape, new exception).

#### Pillars

Analyze the code changes against the following pillars. Where a pillar lists specific things to watch for, treat that list as the concrete checklist for that pillar — don't go looking for a separate, more detailed pass later.

- **Correctness**: Does the code achieve the intended behavior from Step 1 without bugs or logical errors? Additionally, for every line the diff **deletes or replaces**, name the invariant or behavior it enforced, then check where the new code re-establishes it — if you can't find it, that's a finding.

- **Spec Conformance** (only when a spec/tickets exist — see Step 1): Walk the spec's numbered requirements (FR/SC IDs) and the tickets' acceptance criteria against the implementation. Classify every mismatch as one of:
  - **missing** — a requirement with no implementation,
  - **partial** — implemented, but an acceptance criterion or stated case is not covered,
  - **scope creep** — behavior the spec never asked for,
  - **wrong implementation** — the code contradicts what the spec says.

  Every conformance finding must cite the requirement ID and quote the spec or ticket line it violates. Missing and wrong-implementation findings are Critical; partial and scope creep go under Improvements — unless the scope creep changes public behavior, which makes it Critical.

- **Edge Cases and Error Handling**: Does the code appropriately handle edge cases and potential errors?

- **Security**: Are there any potential security vulnerabilities or insecure coding practices? Specifically look for:
  - injection risks,
  - unsafe deserialization,
  - missing authorization or permission checks,
  - secret leakage,
  - logging sensitive data,
  - unsafe file/path handling,
  - overly broad CORS, permissions, scopes, or access policies,
  - trusting client-provided data without validation.

- **Reuse**: Actively search the repository for existing utilities, helpers, shared modules, adjacent implementations, framework APIs, or project patterns that could replace newly introduced custom code. Flag:
  - new functions that duplicate existing functionality,
  - inline logic that should use an existing utility,
  - hand-rolled string manipulation, path handling, environment checks, validation, type guards, sorting, filtering, or similar reusable logic,
  - newly added dependencies that duplicate the standard library, a platform feature, or an already-installed dependency — name the built-in that covers it.

- **Project Conventions**: Does the code follow the conventions identified in Step 3? This includes naming, structure, patterns, and any rules defined in project-specific skills or config files.

- **Maintainability**: Is the code clean, well-structured, and easy to understand and modify in the future? Pay special attention to:
  - redundant state that could be derived instead,
  - parameter sprawl where a config object or clearer data structure would be simpler,
  - unjustified abstractions, especially abstractions requiring flags or special cases,
  - speculative generality — abstractions with a single implementation, configuration options nothing sets, layers with a single caller, flexibility for requirements that don't exist yet,
  - premature unification — shared helpers or components extracted from only two similar sites, or DRY that needs flags, extra props, or special cases to serve its callers; duplication is cheaper than the wrong abstraction, so never suggest extracting shared code unless the same logic appears three or more times with no meaningful variation,
  - dead code introduced by the change — unused exports, unreachable branches, features added "just in case",
  - leaky abstractions that expose internal details,
  - stringly-typed code where constants, enums, or typed identifiers already exist,
  - wrapper layers that only delegate without adding value,
  - unnecessary comments that explain obvious "what" instead of non-obvious "why".

- **Readability**: Is the code well-commented where it matters, and consistently formatted? (Formatting deviations from project tooling belong under Convention, not here.)

- **Efficiency**: Are there any obvious performance bottlenecks or resource inefficiencies introduced by the changes? Pay special attention to:
  - redundant computation,
  - repeated file reads,
  - duplicate network/API/database calls,
  - N+1 query patterns,
  - missed safe concurrency for independent operations,
  - blocking work added to startup, request handling, loops, render paths, or other hot paths,
  - recurring no-op updates in polling, intervals, subscriptions, observers, or event handlers,
  - pre-checking resource existence instead of operating directly and handling errors,
  - unbounded memory growth, missing cleanup, leaked listeners, timers, or subscriptions,
  - overly broad reads or fetches when only a subset is needed.

- **Testability**: Is the new or modified code adequately covered by tests (even if preflight checks pass)? Suggest additional test cases that would improve coverage or robustness. Watch for **fake tests**: assertions that cannot fail (`expect(true).toBe(true)`), tests that never exercise the changed code path, or assertions weakened until they pass — a fake test on changed logic is a Critical finding, because it reports coverage that doesn't exist.

### 5. Verify Findings

The value of a review is precision — a report padded with false positives gets ignored. Before presenting anything, filter the aggregated findings:

- **Try to refute every Critical finding.** Re-read the code path, look for a guard elsewhere, check whether a caller already handles it. Keep it as Critical only if you can name the concrete inputs or state that trigger it and point at the offending line. If the mechanism is real but the trigger is uncertain, downgrade it to Improvements and say what would confirm it.
- **Drop findings that**:
  - sit entirely in code the change didn't touch (pre-existing issues — one brief aside at most),
  - a linter, typechecker, or compiler in the project would catch anyway,
  - are nitpicks a senior engineer wouldn't bother raising,
  - describe behavior changes that are clearly the _point_ of the diff,
  - demand extra hardening or robustness without a concrete failure scenario.
- **Cap the report** at roughly 10 findings, ranked most severe first. If more survive verification, keep the most severe and summarize the rest in one line.
- **A clean diff is a valid outcome.** If nothing survives, say so plainly and approve — don't invent findings to appear thorough.

### 6. Provide Feedback

By default, present the review in the conversation using the structure below — don't post anything to GitHub automatically. For remote PRs, ask the user whether they'd also like you to publish it as a GitHub review or comments (e.g. via `gh pr review`/`gh pr comment`) before doing so.

#### Structure

- **Summary**: A high-level overview of the review — whether the change delivers the intended behavior from Step 1, the preflight/verification outcome (including "no automated verification found"), and a note if no project conventions were discovered.
- **Findings** — every finding cites `file:line`; Critical findings also state the concrete failure scenario. Skip any category with nothing to report:
  - **Critical**: Bugs, security issues, data loss/corruption risks, or breaking changes — anything that blocks a merge.
  - **Reuse**: Duplicated logic or missed opportunities to use existing utilities, helpers, shared modules, framework APIs, or established local patterns.
  - **Improvements**: Suggestions for better maintainability, quality, testability, or performance — plus minor correctness or robustness issues that don't block a merge.
  - **Convention**: Deviations from project-specific conventions found in skills, config files, docs, or nearby code.
  - **Nitpicks**: Formatting or minor style issues (optional).
  - **Pre-existing** (optional): the single brief aside about serious problems outside the diff, allowed by the ground rules.
- **Conclusion**: exactly one of **Approve** / **Request Changes** / **Needs Discussion** — the verdict reflects only merge-gate status, with no modifiers; residual work belongs in the findings above.
  - Any Critical finding → **Request Changes**.
  - Unresolved questions about the intended behavior → **Needs Discussion**, listing the open questions so the author knows what to answer.
  - Everything else — suggestions alone never block → **Approve**.

#### Tone

- Be constructive, professional, and friendly.
- Explain _why_ a change is requested.
- When flagging convention issues, reference the specific skill or config file where the rule comes from (e.g., "per the `api-conventions` skill…" or "`.eslintrc` requires…").
- For approvals, acknowledge the specific value of the contribution.

### 7. Cleanup (Remote PRs only)

- After the review, ask the user if they want to switch back to the default branch (e.g., `main` or `master`).
- If you stashed local changes in Step 2, restore them now with `git stash pop` once back on the original branch.
