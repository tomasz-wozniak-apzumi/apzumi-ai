# OpenSpec Documentation Starter

Reusable boilerplate for project managers, business analysts, product owners, and delivery leads who want to create implementation-ready project documentation with OpenSpec.

It lives at `Documentation/ClaudeCode` inside the shared [Apzumi-com/apzumi-ai](https://github.com/Apzumi-com/apzumi-ai) repository. **Setting up a new project? Start with [the setup guide](https://github.com/Apzumi-com/apzumi-ai/blob/main/Documentation/ClaudeCode/ONBOARDING.md)**, which covers the whole path from an empty machine to a working specs repository, for macOS and Windows.

A project made from this boilerplate is a **documentation repository with the code repositories attached as git submodules** — one checkout, from which every artifact can be grounded in the real code of every platform. See [Connected Implementation Repositories](#connected-implementation-repositories).

This boilerplate provides:

- A project-level OpenSpec configuration in `openspec/config.yaml`.
- Project conventions in `openspec/CONVENTIONS.md` and artifact schema in `openspec/SCHEMA.md`.
- ClaudeCode instructions in `.claude/CLAUDE.md` for PM/BA-friendly OpenSpec work.
- Reusable OpenSpec slash commands in `.claude/commands/`, including `/link-repos` to attach the code repositories.
- A repository-wiring check in `scripts/check-repos.mjs`, run automatically at session start.
- A standalone example change in `examples/simple-change/`.

## Setting up a new project

**Full setup instructions live in [the setup guide](https://github.com/Apzumi-com/apzumi-ai/blob/main/Documentation/ClaudeCode/ONBOARDING.md)** — installing the applications, SSH, creating and cloning the repository, installing Claude Code and OpenSpec, and a prompt you paste into Claude Code that does the rest for you. They are not repeated here; this README is the reference for what the boilerplate *is* and how to work with it afterwards.

Four things worth knowing about the shape of that setup:

- This folder is **not a repository of its own**. The project's specs repository is created on GitHub and cloned first, and setup copies this folder's *contents* into that clone — dotfiles included, since `.claude/` carries the slash commands and the session-start check.
- **Restart Claude Code once the files are in.** They are read at session start, so the session that copied them in does not have them.
- The code repositories are attached as submodules by `/link-repos`, which writes the CONVENTIONS.md table at the same time. Use it later too — whenever a repository is added, moved, retargeted to another branch, or removed.
- [SETUP.md](SETUP.md) is the per-project configuration checklist. Work through it once the files are in place.

## Updating an existing project from the boilerplate

Projects are copies, not clones, so improvements to the boilerplate do not arrive on their own. When it ships something worth taking, copy those files over deliberately — the split matters:

| | Files | How to update |
|---|---|---|
| **Boilerplate-owned** | `openspec/SCHEMA.md`, `.claude/commands/`, `scripts/check-repos.mjs`, `skills/` | Safe to overwrite wholesale, unless the project deliberately customised one |
| **Merge by hand** | `.claude/settings.json`, `.claude/CLAUDE.md`, `README.md`, `SETUP.md` | Carry over the new parts; these accumulate project-specific edits |
| **Project-owned** | `openspec/config.yaml`, `openspec/CONVENTIONS.md`, `openspec/changes/`, `openspec/specs/`, `.gitmodules`, `submodules/` | Never overwrite — this is the project's own content |

Afterwards, re-run `openspec validate --all` and `node scripts/check-repos.mjs --validate`, and commit the update as its own change so the diff is reviewable.

## Connected Implementation Repositories

The documentation and the code it describes live in different repositories. This one holds `openspec/`; each platform's code is attached under `submodules/<platform-slug>/`, and `openspec/CONVENTIONS.md` records the platform label, path, clone URL, and working branch for each.

Three consequences run through the whole boilerplate:

- **Paths are repository-qualified.** `submodules/backend/src/...`, never a bare `src/...`. On a multi-repository project an unprefixed path does not identify a file, and `SCHEMA.md` and `.claude/CLAUDE.md` both say so.
- **An empty repository path means "not checked out", not "no code".** This is the failure mode worth designing against: an agent that reads an uninitialised submodule as an empty codebase invents every file it then names, and the result looks like a confident, grounded design.
- **`.gitmodules` and CONVENTIONS.md must agree.** `node scripts/check-repos.mjs --validate` fails when they drift — an undocumented submodule, a documented repository that was never added, a platform label matching no row in the platform table, or a URL or branch recorded in one place and not the other.

A fresh copy has no repositories, and nothing in it can guess them, so it **asks**: the `SessionStart` hook in `.claude/settings.json` runs the same check, which reports the missing wiring into the session until it is done. `/link-repos` is what resolves it — it interviews for each repository, verifies the URL resolves, runs `git submodule add -b`, and writes the table. The same command handles adding, moving, retargeting, and removing a repository later.

A project whose code genuinely lives in this repository writes `None — the code lives in this repository.` under that heading and is never asked again.


## Repository Structure

```text
.
├── README.md
├── SETUP.md
├── ONBOARDING.md                # the setup guide — not copied into projects
├── onboarding-assets/           # its screenshots — likewise
├── .gitignore
├── .gitmodules                  # the connected code repos (written by /link-repos)
├── .claude/
│   └── commands/                # slash commands, incl. /link-repos
│   └── CLAUDE.md
│   └── settings.json            # permissions + the SessionStart wiring check
├── scripts/
│   └── check-repos.mjs
├── submodules/                  # the code itself, one directory per platform
│   ├── backend/
│   └── frontend/
├── skills/                      # reference prompts for discovery and audits
├── examples/
│   └── simple-change/
└── openspec/
    ├── config.yaml
    ├── CONVENTIONS.md
    └── SCHEMA.md
```

Everything above is copied into a new project as-is, except `ONBOARDING.md` and `onboarding-assets/`, which describe how to set a project up and have no place inside one. `submodules/` and `.gitmodules` do not exist until `/link-repos` creates them.

## Customization Points

- `openspec/config.yaml`: project name, product context, domain, deployment, platforms, and standards.
- `openspec/CONVENTIONS.md`: project-specific context, terminology, platforms, and the connected implementation repositories.
- `openspec/SCHEMA.md`: artifact structure and format — spec files, requirements, tasks, design docs, Figma links, and test scenarios.
- `.claude/CLAUDE.md`: collaboration rules for AI-assisted OpenSpec work.
- `.claude/commands/`: reusable slash commands for discovery, repository wiring, and OpenSpec workflows.
- `.claude/settings.json`: permissions and the session-start repository-wiring check.
- `skills/`: longer reference prompts (discovery questions, transcript-to-modules, project audit). They are plain files here, not loaded automatically — move one to `.claude/skills/<name>/SKILL.md` in a project that wants ClaudeCode to pick it up.

## Example Change

The `examples/simple-change/` folder shows the expected shape and level of detail for a small OpenSpec change. It is intentionally outside `openspec/changes/` so it does not appear as an active project change.

## Notes For New Projects

- Keep active project work under `openspec/changes/` after creating it with the OpenSpec CLI.
- Keep examples under `examples/` so they remain instructional only.
- Commit OpenSpec artifacts to Git so documentation decisions are reviewed and versioned.
- Commit `.gitmodules` and the submodule pointers too, but bump a pointer deliberately — a pointer bump says "this documentation now describes that commit of the code".
- Separate confirmed facts, assumptions, risks, and open questions in every proposal or design artifact.
