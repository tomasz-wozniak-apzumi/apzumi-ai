---
name: git-workflow
description: Enforce Conventional Commits format and safe read-only git practices. Use when making commits, creating branches, writing commit messages, or performing any git operation. Also trigger for formatting commit messages with the correct type, scope, and subject rules (lowercase, verb base form, no period, max 100 chars).
---

# Git Workflow

This skill ensures that all Git operations follow the project's strict Conventional Commits format and safe read-only
practices unless explicitly instructed otherwise.

## Read-Only Safety

**READ-ONLY COMMANDS** - Read-only git commands only (status, log, diff, show, branch -r, etc.) unless specifically
instructed otherwise by user.

## Conventional Commits

Use Conventional Commits format for all commit messages.

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

## Branch Creation

**Branch naming:**

- **Ticket known** → `feature/<TICKET>-<short-description>` (ticket uppercase, rest lowercase, hyphenated)
- **No ticket** → `<type>/<scope>-<short-description>` (lowercase, hyphenated)

`<short-description>` is 2–4 words derived from the dominant change.

**Examples:**

| Situation          | Branch name                       |
| ------------------ | --------------------------------- |
| Ticket XYZ-123     | `feature/XYZ-123-add-user-auth`   |
| Ticket ABC-42      | `feature/ABC-42-fix-null-pointer` |
| No ticket, feature | `feat/auth-add-oauth-support`     |
| No ticket, fix     | `fix/api-resolve-timeout`         |

**Command:** `git checkout -b <branch-name>`

Never force-push or reset an existing branch without explicit user approval.
