# Setup Checklist

Use this checklist when starting a new OpenSpec documentation repository from this boilerplate.

**The fastest route is the ready-made prompt in [the setup guide](https://github.com/Apzumi-com/apzumi-ai/blob/main/Documentation/ClaudeCode/ONBOARDING.md)** — paste it into ClaudeCode and it works through steps 0 to 2 with you, asking for what it cannot derive. This checklist is the manual equivalent, and the record of what "done" looks like either way.

Steps 0 to 2 assume the earlier setup is done: the specs repository exists on GitHub, is cloned locally, and ClaudeCode is open on that clone with the OpenSpec CLI installed. The setup guide covers all of that, for macOS and Windows.

## 0. Copy The Boilerplate Into Your Clone

This boilerplate is the folder `Documentation/ClaudeCode` inside the shared [Apzumi-com/apzumi-ai](https://github.com/Apzumi-com/apzumi-ai) repository, not a repository of its own. Your specs repository already exists and is already cloned, so setup means copying this folder's *contents* into that clone. Nothing here creates a repository or touches your remote.

- [ ] From inside your clone, copy the contents in.

      **macOS / Linux / WSL / Git Bash:**

```bash
git clone --depth 1 https://github.com/Apzumi-com/apzumi-ai.git /tmp/apzumi-ai
rm -rf /tmp/apzumi-ai/Documentation/ClaudeCode/ONBOARDING.md /tmp/apzumi-ai/Documentation/ClaudeCode/onboarding-assets
cp -R /tmp/apzumi-ai/Documentation/ClaudeCode/. .
rm -rf /tmp/apzumi-ai
find . -name '.DS_Store' -delete
```

      **Windows PowerShell:**

```powershell
git clone --depth 1 https://github.com/Apzumi-com/apzumi-ai.git $env:TEMP\apzumi-ai
robocopy "$env:TEMP\apzumi-ai\Documentation\ClaudeCode" . /E /XF ONBOARDING.md /XD onboarding-assets
Remove-Item -Recurse -Force $env:TEMP\apzumi-ai
```

      `robocopy` reports success with exit codes 0–7; treat 8 or higher as a real failure.

      `ONBOARDING.md` and `onboarding-assets/` are excluded on purpose: they are the setup guide itself, not project content. Both forms drop them at the source — `cp` has no exclude flag, so the macOS form removes them from the throwaway clone first. Nothing is ever deleted from your own repository to achieve it, which matters if the project has an `ONBOARDING.md` of its own.

- [ ] Confirm `.claude/` came along — `ls -a` on macOS, `Get-ChildItem -Force` in PowerShell. Getting the dotfiles across is the fragile part: on macOS the trailing `/.` in the source path is what does it (a `/*` glob skips them), and on Windows `robocopy` includes them where `Copy-Item` with a wildcard may not. Without `.claude/` you silently lose the slash commands and the session-start check.
- [ ] Check `git status` before committing. A repository created from GitHub usually has a `README.md`, and may have a `LICENSE` or `.gitignore` — the copy overwrites those. Keep whichever version you want.
- [ ] Restart ClaudeCode so the commands and hooks that just landed in `.claude/` are loaded. They are read at session start, so the session that copied them in does not have them.

## 1. Project Context

- [ ] Set the project name in `openspec/config.yaml`.
- [ ] Describe the product type, business domain, and client type.
- [ ] Confirm the expected deployment environment.
- [ ] List all relevant platforms, stacks, and scope notes.
- [ ] Remove platform entries that do not apply.

## 2. Connect The Implementation Repositories

The code this repository documents lives elsewhere, attached here as git submodules under `submodules/`. Do this before the first change — a design written while the code is missing is a design written against nothing.

- [ ] In the restarted ClaudeCode session, the session-start hook (`.claude/settings.json` → `scripts/check-repos.mjs`) notices that no repositories are connected and prompts for them. You can also run the check yourself:

```bash
node scripts/check-repos.mjs --status
```

- [ ] Run `/link-repos` and answer, per platform: the clone URL exactly as the team uses it (SSH — `.gitmodules` hands this string to everyone else), and the branch work happens on. The command adds each submodule and fills the Connected Implementation Repositories table in `openspec/CONVENTIONS.md`. Equivalent by hand:

```bash
git submodule add -b {branch} {url} submodules/{platform-slug}
```

- [ ] Give a platform whose repository does not exist yet a row with an empty `Path` and `planned` in `Notes`. An undocumented repository, or a documented one with no submodule, is an error; a documented gap is not.
- [ ] No code repositories at all (the code lives in this repository)? Write `None — the code lives in this repository.` under that heading instead of a table. That line is what stops the hook asking every session.
- [ ] Commit the result — `git submodule add` stages `.gitmodules` and the gitlink but does not commit.
- [ ] Tell the team how to clone. This is the step people miss, and a missing submodule looks exactly like an empty codebase:

```bash
git clone --recurse-submodules {url of this specs repository}
```

  Already cloned, or a repository was added later:

```bash
git submodule update --init --recursive
```

- [ ] Confirm every path holds real content (`git submodule status` prefixes an uninitialised submodule with `-`).

## 3. Documentation Standards

- [ ] Review `openspec/CONVENTIONS.md` (context, terminology, platforms, repository wiring) and `openspec/SCHEMA.md` (artifact structure and format).
- [ ] Fill in approved business terminology.
- [ ] Decide whether every frontend change must reference Figma.
- [ ] Decide whether every behavior-changing change needs `test-scenarios.md`.
- [ ] Decide whether automated tests are expected during planning, implementation, or both.
- [ ] Adjust task rules to match the delivery team's working style.

## 4. AI Collaboration Rules

- [ ] Review `CLAUDE.md`.
- [ ] Keep PM/BA guidance that applies to the team.
- [ ] Add any client-specific compliance, security, privacy, or delivery constraints.
- [ ] Add naming conventions for roles, workflows, modules, or business events if known.

## 5. ClaudeCode Commands

- [ ] Confirm ClaudeCode loads `.claude/settings.json`.
- [ ] Confirm the project commands are visible in ClaudeCode.
- [ ] Keep only commands that the team will use. Keep `/link-repos` as long as the project has connected repositories — step 2 needs it, and it is what keeps `.gitmodules` and CONVENTIONS.md in step afterwards.
- [ ] Confirm `.claude/settings.json` still carries the `SessionStart` hook. It is the only thing that makes a fresh copy ask for its repositories instead of waiting to be told; removing it should be a deliberate choice, not tidying.
- [ ] Restart ClaudeCode after changing `.claude/settings.json`, `.claude/commands/`, or other ClaudeCode configuration files.

## 6. First Change

- [ ] Gather initial business context, stakeholder notes, or a meeting transcript.
- [ ] Generate discovery questions if the request is still unclear.
- [ ] Split large transcript notes into OpenSpec-sized modules if needed.
- [ ] Start the first change with `/opsx-new <change-name>` or `/opsx-propose <description>`.
- [ ] Keep assumptions and open questions explicit instead of blocking progress on every missing detail.

## 7. Validation

Run these checks after setup:

```bash
openspec list --json
openspec validate --all
node scripts/check-repos.mjs --validate
```

An empty starter repository may report that there are no items to validate. That is expected before the first active change or main spec exists.

`check-repos.mjs --validate` compares `.gitmodules` against the Connected Implementation Repositories table and exits non-zero when they disagree — an undocumented submodule, a documented repository that was never added, a platform label matching no row in the platform table, or a URL or branch recorded in one place and not the other. Without `--validate` it prints the same setup notes the session-start hook reports, and never fails. It uses Node built-ins only, so it needs no install beyond the Node that the OpenSpec CLI already requires.

## 8. Commit And Push

If you set the repository up with the prompt from the setup guide, it already committed and pushed its own work — this step covers whatever you changed afterwards while working through this checklist.

- [ ] Commit the setup to the specs repository:

```bash
git add .
git commit -m "chore: set up specs repository from the Apzumi OpenSpec boilerplate"
git push
```

- [ ] Confirm `.gitmodules` and the submodule pointers are part of that commit — without them, a teammate's clone has no code attached.
- [ ] Tell the team the repository is ready, and how to clone it (`git clone --recurse-submodules`).
