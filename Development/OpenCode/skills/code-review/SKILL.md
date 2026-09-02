---
name: code-review
description: Use this skill whenever the user asks to review code, check changes, review a PR, or analyze diffs. It supports both local changes (staged or working tree) and remote Pull Requests (by ID or URL). It focuses on correctness, maintainability, and adherence to project standards.
---

# Code Reviewer

This skill guides the agent in conducting professional and thorough code reviews for both local development and remote Pull Requests.

## Workflow

### 1. Determine Review Target

- **Remote PR**: If the user provides a PR number or URL (e.g., "Review PR #123"), target that remote PR.
- **Local Changes**: If no specific PR is mentioned, or if the user asks to "review my changes", target the current local file system states (staged and unstaged changes).

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

#### 3a. Scan Available Skills

Check the list of available skills. Look for any skills that describe project-specific patterns, architecture decisions, naming conventions, or coding standards. If found, **read those skills** and treat their contents as authoritative project conventions for this review.

#### 3b. Scan Project Config and Docs

Also look for convention signals directly in the repository:

- **Linter/formatter configs**: `.eslintrc*`, `.prettierrc*`, `pyproject.toml`, `.flake8`, `rubocop.yml`, etc.
- **Style guides**: `CONTRIBUTING.md`, `docs/style-guide.md`, `docs/conventions.md`, or similar files.
- **Architecture docs**: `docs/architecture.md`, `ADR/` folders, `ARCHITECTURE.md`.
- **Test conventions**: Look at existing test files to understand naming patterns, structure, and tooling used.
- **Git conventions**: `.gitmessage`, commit history style, branch naming.

#### 3c. Apply Conventions in Review

Use everything found in 3a and 3b as a checklist during the In-Depth Analysis phase. Flag any deviations from project conventions explicitly in the findings, tagging them clearly as **Convention** issues so they're easy to distinguish from general code quality concerns.

If no conventions are found, note this briefly and fall back to widely accepted best practices for the language/framework in use.

### 4. In-Depth Analysis

Analyze the code changes based on the following pillars. Where a pillar lists specific things to watch for, treat that list as the concrete checklist for that pillar — don't go looking for a separate, more detailed pass later.

- **Correctness**: Does the code achieve its stated purpose without bugs or logical errors?

- **Reuse**: Actively search the repository for existing utilities, helpers, shared modules, adjacent implementations, framework APIs, or project patterns that could replace newly introduced custom code. Flag:
  - new functions that duplicate existing functionality,
  - inline logic that should use an existing utility,
  - hand-rolled string manipulation, path handling, environment checks, validation, type guards, sorting, filtering, or similar reusable logic.

- **Maintainability**: Is the code clean, well-structured, and easy to understand and modify in the future? Pay special attention to:
  - redundant state that could be derived instead,
  - parameter sprawl where a config object or clearer data structure would be simpler,
  - unjustified abstractions, especially abstractions requiring flags or special cases,
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

- **Security**: Are there any potential security vulnerabilities or insecure coding practices? Specifically look for:
  - injection risks,
  - unsafe deserialization,
  - missing authorization or permission checks,
  - secret leakage,
  - logging sensitive data,
  - unsafe file/path handling,
  - overly broad CORS, permissions, scopes, or access policies,
  - trusting client-provided data without validation.

- **Edge Cases and Error Handling**: Does the code appropriately handle edge cases and potential errors?

- **Testability**: Is the new or modified code adequately covered by tests (even if preflight checks pass)? Suggest additional test cases that would improve coverage or robustness.

- **Project Conventions**: Does the code follow the conventions identified in Step 3? This includes naming, structure, patterns, and any rules defined in project-specific skills or config files.

#### Handling Large Diffs

If the diff spans many files or thousands of lines, don't try to load and reason about all of it at once. Work through it file-by-file or module-by-module, keeping a running list of findings, and only hold the full picture in mind when writing the final summary.

### 5. Provide Feedback

By default, present the review in the conversation using the structure below — don't post anything to GitHub automatically. For remote PRs, ask the user whether they'd also like you to publish it as a GitHub review or comments (e.g. via `gh pr review`/`gh pr comment`) before doing so.

#### Structure

- **Summary**: A high-level overview of the review.
- **Findings**:
  - **Critical**: Bugs, security issues, or breaking changes.
  - **Reuse**: Duplicated logic or missed opportunities to use existing utilities, helpers, shared modules, framework APIs, or established local patterns.
  - **Improvements**: Suggestions for better maintainability, quality, testability, or performance.
  - **Convention**: Deviations from project-specific conventions found in skills, config files, docs, or nearby code.
  - **Nitpicks**: Formatting or minor style issues (optional).
- **Conclusion**: Clear recommendation (Approved / Request Changes).

#### Tone

- Be constructive, professional, and friendly.
- Explain _why_ a change is requested.
- When flagging convention issues, reference the specific skill or config file where the rule comes from (e.g., "per the `api-conventions` skill…" or "`.eslintrc` requires…").
- For approvals, acknowledge the specific value of the contribution.

### 6. Cleanup (Remote PRs only)

- After the review, ask the user if they want to switch back to the default branch (e.g., `main` or `master`).
- If you stashed local changes in Step 2, restore them now with `git stash pop` once back on the original branch.
