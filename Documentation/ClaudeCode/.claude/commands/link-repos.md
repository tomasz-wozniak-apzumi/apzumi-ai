---
name: "Link Repos"
description: Connect this documentation repository to the implementation code repositories as git submodules, and record them in openspec/CONVENTIONS.md
category: Setup
tags: [setup, repositories, submodules]
---

Attach the code this repository documents, as git submodules under
`submodules/<platform-slug>/`, and record them in the
`## Connected Implementation Repositories` table in `openspec/CONVENTIONS.md`.

Run this on a fresh copy of the boilerplate, and again whenever a repository is
added, moved, retargeted to another branch, or removed.

**Input**: none needed. Anything after `/link-repos` is treated as a hint about
which repositories to connect (e.g. a platform name).

## Why both halves matter

The submodules make the code readable from here; the table makes it
*attributable* — it maps each platform label to the path that every artifact
prefixes its file paths with. `node scripts/check-repos.mjs --validate` fails
when the two disagree, so never write one without the other.

**Never invent a repository URL, branch, or path.** Nothing in this repository
can derive them; if you do not have one, ask.

## Steps

1. **Read the current state**

   ```bash
   git rev-parse --show-toplevel
   git submodule status
   ```

   - Not a git repository → stop and report it. The specs repository is
     created on GitHub and cloned before setup begins, so this means the
     session is running somewhere other than that clone. Do not `git init`
     your way out of it — that would make a repository with no remote, and
     the submodules would be added to the wrong place.
   - Not at the repository root → `cd` to the toplevel; submodule paths are
     recorded relative to it.

   Then read `.gitmodules` (if present) and, in `openspec/CONVENTIONS.md`, both
   the `## Platform Architecture` table (the platform labels, used verbatim in
   spec files and `tasks.md`) and the `## Connected Implementation Repositories`
   table.

   Report what is already wired before asking for anything — a re-run should
   only ask about what is missing.

2. **Ask for the repositories**

   Ask once, as a single grouped question — not one repository at a time. Use
   the **AskUserQuestion tool** where it fits. For each platform in the Platform
   Architecture table that has no submodule yet, get:

   - **Repository URL** — exactly as the team clones it. Match the form their
     other clones use (SSH `git@host:org/repo.git` vs HTTPS): CI and every
     teammate inherit this string from `.gitmodules`. If the user gives a
     shorthand (`org/repo`), confirm the full URL rather than assuming a host.
   - **Working branch** — the branch work actually happens on. Ask; do not
     assume `main`. Recording it is the point of the `-b` flag below.
   - **Local path** — default `submodules/<platform-slug>` (lowercase, kebab:
     `Mobile iOS` → `submodules/mobile-ios`). Confirm any non-default path.

   Also ask whether any platform has **no repository yet** — planned, or owned
   by a client team with access still pending. Those get a row with an empty
   Path and a `planned` note: a documented gap beats a missing line.

   If the Platform Architecture table still holds `{placeholders}`, ask for the
   platform labels in the same message — the two tables are filled together.

   Read the list back and get a yes before running any `git` command.

3. **Verify access, then add each submodule**

   Check the URL resolves before touching the working tree; a typo or a missing
   SSH key otherwise leaves a half-added submodule to clean up:

   ```bash
   git ls-remote "<url>" HEAD
   ```

   Failure → report it verbatim (auth and not-found are different problems),
   skip that repository, carry on with the rest. Do not retry with a guessed
   alternative URL form.

   Then:

   ```bash
   git submodule add -b "<branch>" "<url>" "submodules/<slug>"
   ```

   - `-b` records the branch in `.gitmodules`, so `git submodule update --remote`
     follows it and the table has something to be checked against.
   - Already added at that path with the same URL → skip it, say so.
   - Already added at that path with a **different** URL → stop and report;
     retargeting is the section below, not something to do implicitly.
   - `git submodule add` **stages** `.gitmodules` and the gitlink but does not
     commit. Leave it staged and say so — committing is the user's call.

4. **Record them in CONVENTIONS.md**

   Fill the `## Connected Implementation Repositories` table, one row per
   repository, using platform labels identical to the Platform Architecture
   table:

   | Platform | Path | Repository | Working branch | Notes |
   | --- | --- | --- | --- | --- |
   | Backend | `submodules/backend` | `git@github.com:org/backend.git` | `develop` | |

   - A planned repository gets a row with an empty Path and a note saying so.
   - Delete the `{placeholder}` row once real rows exist.
   - If the code genuinely lives in this repository, write
     `None — the code lives in this repository.` under the heading instead of a
     table, and add no submodules. That line is what stops the session-start
     check asking again.

5. **Verify and hand back**

   ```bash
   git submodule status
   node scripts/check-repos.mjs --validate
   ```

   `git submodule status` prefixes a line with `-` when a submodule is declared
   but not checked out. Every path must hold real content: an empty directory
   reads to a later session as "this codebase is empty", which is how a design
   ends up inventing every file it names.

   Then report what was added, what was skipped and why, and give the user the
   line their teammates need:

   ```bash
   git clone --recurse-submodules <this repo>
   # already cloned:
   git submodule update --init --recursive
   ```

## Removing, moving, or retargeting a repository

Only on an explicit request, and one repository at a time. Removal is four
steps, and skipping one leaves a state that looks fine until someone re-clones:

```bash
git submodule deinit -f "submodules/<slug>"
git rm "submodules/<slug>"                    # drops the .gitmodules entry too
rm -rf ".git/modules/submodules/<slug>"       # the cached clone
```

Then delete the row from CONVENTIONS.md and re-run the check. To move a
repository, `git mv` the path and update both `.gitmodules` and the table. To
change the tracked branch:

```bash
git config -f .gitmodules submodule."submodules/<slug>".branch "<new-branch>"
git submodule sync -- "submodules/<slug>"
```

and update the Working branch cell in the same edit — the check compares them.

## Guardrails

- Never invent a repository URL, branch, or path, and never substitute a
  guessed URL form when one fails.
- Never `git commit` or `git push` — in this repository or in a submodule —
  unless the user asks in that message. `git submodule add` leaving two files
  staged is the expected end state here.
- Never edit code inside a submodule from this command. It wires repositories
  up; implementation is a separate, later step.
- Never remove a submodule as a side effect of adding or renaming another.
- A submodule checkout sits on a detached HEAD by default. Do not "fix" that
  here — the working branch is checked out when there is something to commit.
- Keep `.gitmodules` and the table in the same edit. A wrong path in the table
  points every future artifact at a directory that does not exist.
