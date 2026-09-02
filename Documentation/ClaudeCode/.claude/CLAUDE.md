# Project Instructions

This workspace helps project managers and business analysts create clear,
implementation-ready project documentation with OpenSpec.

The code this workspace documents lives in separate repositories, attached here
as git submodules under `submodules/` and listed in `openspec/CONVENTIONS.md`
under Connected Implementation Repositories.

@SETUP.md
@openspec/CONVENTIONS.md

## Project references

- `openspec/` — Project OpenSpec config, conventions, and artifacts
- `submodules/` — The connected implementation repositories (the code itself)
- `examples/` — Example changes and artifact structure

## First Session In A New Project

This repository starts life as a copy of the boilerplate, and the one thing no
copy can derive is which code repositories it documents. A session-start hook
runs `scripts/check-repos.mjs` and reports what is still missing. When it does,
raise it with the user before writing artifacts rather than working around it:

- **No repositories connected** → ask which repositories belong to this project
  (one per platform: the clone URL and the branch work happens on), then run
  `/link-repos` to attach them as submodules and record them in
  `openspec/CONVENTIONS.md`. If the code lives in this same repository, have the
  user confirm it and write `None — the code lives in this repository.` under
  that heading.
- **Submodules declared but empty** → they are not checked out. Ask for
  `git submodule update --init --recursive`. Never read an empty repository path
  as "this codebase has nothing in it".
- **Boilerplate placeholders left** → offer to walk through `SETUP.md`.

## Connected Repositories

- Read the Connected Implementation Repositories table before searching for
  code: a search that ignores those paths finds documentation and concludes
  there is no codebase.
- **Every path in every artifact is repository-qualified** —
  `submodules/backend/src/...`, never a bare `src/...`. The prefix is what tells
  the implementer which repository to open.
- **An empty repository path means the submodule is not checked out**, not that
  the code does not exist. Stop and ask for
  `git submodule update --init --recursive`; anything written against an empty
  directory is invented.
- Implement inside the repository the task names. A fresh submodule sits on a
  detached HEAD — check its state with `git -C <path> status` and check out the
  documented working branch before any commit inside one, or the commit is lost
  on the next update.
- Committing, pushing, opening PRs, and bumping this repository's submodule
  pointer are explicit user requests, never side effects of finishing a task.
- Run a repository's tests from inside that repository, with its own runner.
- Use `/link-repos` to add, move, retarget, or remove a repository — it keeps
  `.gitmodules` and the CONVENTIONS.md table in step, which
  `node scripts/check-repos.mjs --validate` checks.

## Audience

- Assume users are PMs, BAs, product owners, or delivery leads unless they say otherwise.
- Translate business goals, stakeholder input, workshop notes, meeting summaries, and rough ideas into structured OpenSpec documentation.
- Use plain business language first. Introduce technical detail only when it is needed to remove ambiguity or guide implementation.
- Be collaborative and pragmatic: help the user move from uncertainty to a usable proposal, not just a polished document.

## OpenSpec Workflow

- Use OpenSpec artifacts as the source of truth for project documentation.
- Prefer the existing OpenSpec commands and skills for change work:
  - `/opsx-new` to start a structured change and show the first artifact template.
  - `/opsx-propose` to create a complete set of planning artifacts from a clear request.
  - `/opsx-continue` to continue drafting or refining an existing change.
  - `/opsx-apply` only when the user is ready to move from documentation to implementation.
  - `/opsx-archive` only after the change is complete and the user asks to archive it.
- When running OpenSpec CLI commands, use resolved paths from `openspec status --change "<name>" --json`; do not assume artifacts live in a specific local folder.
- Follow `openspec instructions <artifact-id> --change "<name>" --json` for each artifact. Use its template, rules, dependencies, and output path.
- Do not copy internal instruction, context, rule, or project-context blocks into generated documentation.

## Documentation Standards

- Produce documentation that is actionable for delivery teams: clear goals, scope, assumptions, requirements, acceptance criteria, risks, dependencies, and implementation tasks where relevant.
- Separate confirmed facts from assumptions, open questions, and recommendations.
- Preserve the user's terminology for domain concepts, roles, workflows, and business events.
- Make requirements testable. Prefer observable behavior over vague statements such as "easy", "fast", "robust", or "user-friendly".
- Include edge cases, unhappy paths, permissions, data requirements, reporting needs, notifications, integrations, compliance constraints, and rollout considerations when relevant.
- Keep artifacts concise but complete. Avoid filler, generic boilerplate, and speculative features not grounded in the user's input.

## Clarifying Questions

- Ask questions when a missing decision would materially change scope, behavior, risk, or delivery effort.
- Group related questions and keep them short. Prefer answering with reasonable assumptions when the uncertainty is minor and can be documented.
- If the user provides incomplete notes, draft the best possible artifact and add an `Open Questions` or `Assumptions` section rather than blocking unnecessarily.
- For ambiguous change names, derive a concise kebab-case name and confirm only when multiple meanings are plausible.

## Collaboration Style

- Start by identifying the intended outcome, affected users, business value, and boundaries of the change.
- When turning notes into documentation, improve structure and clarity without changing meaning.
- When proposing content, explain important assumptions and tradeoffs briefly.
- When reviewing existing artifacts, focus on gaps, contradictions, unclear requirements, missing acceptance criteria, and delivery risks.
- Do not make broad structural changes to the OpenSpec setup unless the user explicitly asks.

## Repository Guardrails

- Prefer small, focused changes that solve the requested task directly.
- Preserve existing project structure under `openspec/` unless asked to reorganize it.
- Ask before making broad or destructive changes.
- Validate configuration changes against the relevant schema when available.
- Do not commit, push, or create pull requests unless explicitly requested.

## Code Comments

- Prefer self-documenting code over comments.
- Add comments only when a purpose, caveat, or deviation from the standard approach is not obvious from the code itself.
- Comments explain why, not what — never restate what the code already says.
- Never write comments that narrate the change ("added X", "new helper", "fixed as requested") — comments are for the future reader of the code, not the reviewer of the diff.
- When modifying code, update or delete nearby comments that no longer match; never leave commented-out code behind.
