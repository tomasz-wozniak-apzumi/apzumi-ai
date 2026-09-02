---
description: Generate commits (--dry to preview; --ticket XYZ-123 or bare ticket ID to set scope; --no-branch to stay on current branch)
agent: build
---

# Commit

Analyze the current changes, group them into focused logical commits, and commit each group following the Conventional Commits specification.

## Arguments

**Here are the arguments currently passed to this prompt:** _`$ARGUMENTS`_.

- **`--dry`** — preview only: analyze, group, and show the summary without staging, branching, or committing.
- **`--no-branch`** — stay on the current branch; do not create or switch to a feature branch. Combinable with `--dry`.
- **Ticket** — accept a bare ID (`/commit XYZ-123`) or `--ticket XYZ-123`; falls back to the branch name (see Step 1).

## Step 1: Survey changes

Inspect git status, diffs, current branch, and recent commit history. Read the diff of any file where you need more context before deciding its group or message.

### Ticket detection (priority order)

1. Explicit argument — first token matching `[A-Z]+-[0-9]+` in the expanded command arguments.
2. Branch name — search the current branch name for `[A-Z]+-[0-9]+` (case-insensitive), e.g. `feature/xyz-123-add-foo` → `XYZ-123`.
3. None — no ticket.

Normalize to UPPERCASE. Use the first match if several are present.

### Branch check

Skip this step entirely if `--no-branch` is enabled.

Otherwise, if the current branch is an integration branch (`main`, `master`, `develop`, `dev`, `release/*`), derive a suggested feature branch name from the dominant commit group and remember it for Step 5:

- **Ticket present** → `feature/<TICKET>-<short-description>`
- **No ticket** → `<type>/<scope>-<short-description>` (lowercase, hyphenated)

If already on a feature branch, skip this.

## Step 2: Skip list

**Always skip:**

- Secrets: `.env`, `.env.*`, `*.key`, `*.pem`, `*secret*`, `*credential*`, `master.key`, `id_rsa*`, `*.p12`, `*.pfx`
- Local notes: `scratch*`, `notes.txt`, `*.local.md`, `TODO.local.md`

If unsure about a file → skip it and mention it in the summary.

## Step 3: Group into logical commits

Group remaining files into the fewest coherent commits. Each commit must represent exactly one logical change. Prefer grouping by domain/feature, then by layer (feature + its tests), then by type.

## Step 4: Write Conventional Commit messages

Use Conventional Commits format. If the `git-workflow` skill is available in this session, read it for the full format rules and hard limits — follow them exactly.

One rule always applies regardless: if a ticket was detected, use it as the scope in uppercase (e.g. `feat(XYZ-123): ...`); otherwise use a lowercase domain word (`auth`, `api`, `ui`) or omit.

## Step 5: Create branch and commit

Skip this step when `--dry` is enabled.

### Branch creation

If `--no-branch` is off, the current branch is an integration branch, and it is not already a feature branch: create and switch to the suggested feature branch (from Step 1) before committing:

```bash
git checkout -b feature/<name>
```

### Commit each group

Order: config/build → source → tests → generated/lock files.

For each group:

```
git add <specific file paths> && git commit -m "<message>"
```

Never use `git add .`, `git add -A`, or `git add -u` — this bypasses the skip list.

## Step 6: Summary

Output **only** the template below — nothing before or after. No preamble (e.g. "Analysis complete..."), no trailing "Notes"/commentary, no explanations of grouping or skipping decisions. One commit per line with its files indented underneath. List skipped files only when there are any.

### Output

```text
<header>
<Ticket: XYZ-123>

refactor(XYZ-123): replace effectOnceIf with native effect
  src/app/foo/bar.ts

Skipped: <files or omit entirely>

Preview only — run /commit XYZ-123 [--no-branch] to apply.
```

- **Header:**
  - `feature/<name> (created)` — branch created this run (not `--dry`)
  - `Branch: feature/<name> (suggested)` — `--dry` on an integration branch
  - `Current branch: <branch-name>` — otherwise
- **`Ticket:` line** (right after header) appears only in `--dry` **and when a ticket was detected**.
- **`Preview only` footer** appears only in `--dry`.
