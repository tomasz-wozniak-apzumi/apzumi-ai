---
name: git-workflow
description: Use this skill when making commits, creating branches, or performing other Git operations. It enforces Conventional Commits and ensures read-only safety when analyzing the repository. Use this skill whenever the user asks to commit changes, write a commit message, create a branch, stage files, or perform any git operation. Also trigger for formatting commit messages with the correct type (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert), scope, and subject rules (lowercase, verb base form, no period). Make sure to use this skill even when the user just says "commit my changes" or "write a commit message" — always apply the Conventional Commits format.
user-invocable: false
---

# Git Workflow

This skill ensures that all Git operations follow the project's strict Conventional Commits format and safe read-only
practices unless explicitly instructed otherwise.

## Git Workflow

**READ-ONLY COMMANDS** - Read-only git commands only (status, log, diff, show, branch -r, etc.) unless specifically
instructed otherwise by user.

**CONVENTIONAL COMMITS** - Use Conventional Commits format for all commit messages.

**Types:** `feat` · `fix` · `docs` · `style` · `refactor` · `perf` · `test` · `build` · `ci` · `chore` · `revert`

**Subject format:** `<type>(<scope>): <description>` — scope optional (e.g. `login`, `api`, `ui`), type and scope lowercase.

**Subject rules:**

> ⚠️ HARD LIMITS — frequently violated, follow exactly:
> - Subject line total (type + scope + description combined): **max 100 characters**
> - **No period** at end of subject
> - Description starts with **lowercase** letter
> - Use verb base form: `add` not `adds`, `fix` not `fixes`, `update` not `updated`

**Body (optional):**

> ⚠️ HARD LIMITS:
> - **Omit** when the subject is self-explanatory — do not pad
> - Explain **WHY**, never WHAT (the diff shows what)
> - **1–3 lines max** — never more
> - Write complete sentences; **never break a sentence across lines**

**Example:** `feat(login): add user authentication`
