# Project

<!-- 2-3 zdania: co budujesz? co to za projekt? -->
<!-- Stack: język, framework, runtime, baza danych -->
<!-- Monorepo / polyrepo — co gdzie leży -->

## Commands

<!-- Uzupełnij: dokładne komendy — to najwyższy ROI w całym pliku -->
<!-- Koniecznie podaj komendę uruchamiającą pojedynczy test/plik — dzięki temu agent -->
<!-- może tanio i samodzielnie domykać pętlę weryfikacji po każdej zmianie -->

- Test (all): `<komenda>`
- Test (single file): `<komenda>`
- Lint: `<komenda>`
- Build: `<komenda>`

## Architecture

<!-- 3–5 katalogów i ich rola — żeby Claude wiedział gdzie szukać -->
<!-- Np.: `src/services/` — logika biznesowa, `src/api/` — endpointy -->

## Gotchas

<!-- Wymagane env vars, dziwactwa środowiska, nieoczywiste zachowania -->
<!-- Np.: „testy integracyjne wymagają działającego Dockera", „nie edytuj `src/generated/`" -->

## Repository Etiquette

<!-- Konwencje branchy i PR-ów, np.: nazwy branchy `feature/JIRA-123-opis`, -->
<!-- opisy PR po angielsku, format commitów (jeśli nie wymusza tego skill/hook) -->

# Core Behavior Rules

- Never invent APIs, file paths, environment variables, commands, or existing behavior — verify against the repository first; if something cannot be verified locally, say so explicitly instead of guessing
- Remove only code introduced by your own changes if it becomes unused; mention pre-existing dead code instead of deleting it
- Mention unrelated issues or risks, but do not fix them unless explicitly requested
- All code, comments, documentation, tests, and commit messages must be in English
- No placeholders, TODOs, or incomplete code — deliver working solutions

# Change Safety Rules

- Do not commit unless explicitly asked
- Never quote or expose secrets; if you encounter committed secrets or credentials, stop and report them

Ask before making changes that affect:

- Public APIs or external interfaces (UX, endpoints, contracts)
- Authentication or authorization logic
- Persistence layer or data model changes
- Dependencies, build system, or configuration
- Backward compatibility or behavior visible outside the codebase

# Execution Discipline

- Before introducing anything new, read existing code, docs, and patterns — prefer what the repository already provides over your own assumptions
- Check whether an available skill covers the task before starting; if one matches, use it instead of improvising
- If intent is ambiguous or has multiple valid interpretations, present them explicitly — don't pick silently
- Question unclear intent before acting
- Transform vague tasks into verifiable goals: "fix bug" → "write a test reproducing it, then make it pass"
- Validate changes using the narrowest relevant test/build/lint step available

# Testing Rules

- Update existing tests when behavior changes
- Add tests only when logic is non-trivial or lacks coverage
- Do not weaken assertions to make tests pass

# Code Quality Principles

- Follow existing project structure and conventions
- Match the style of surrounding code exactly — naming, decomposition, formatting, and markup — even when you would normally choose differently
- Deviate from local style only if it conflicts with an explicit rule above, or if mimicking it would reproduce a bug or inconsistency
- Prefer simple, minimal solutions — no speculative abstractions, no flexibility beyond what the task requires
- Extract recurring meaningful values into named constants; no magic numbers
- Prefer early returns over nested conditionals; keep functions flat
- Default to private/protected members; expose only what the design requires

# Comments

- Default: zero comments. Every comment is an exception that must state something the code cannot show — "why", never "what"
- Do not paper over unclear code with a comment — rewrite the code first: rename, extract, simplify, strengthen types; comment only what the rewritten code still cannot express
- Irreducibly complex or externally constrained code is the exception: there a clarifying comment is the correct tool, not a failure
- The only kinds worth writing: rationale and rejected alternatives (so nobody "fixes" it back); non-obvious facts (units, boundary conditions, invariants, ordering, hidden side effects); warnings on code that must stay surprising, with a link to the issue or spec; links to the source of copied code, the algorithm or standard implemented, or the ticket behind a non-obvious fix; public API docs that add facts not visible in the signature
- This section OVERRIDES "match the style of surrounding code" — even in a comment-heavy file, add no comments of your own
- Before finishing, re-read each comment you added: if the code can be changed to make it unnecessary, change the code and delete the comment
- When modifying code, update or delete nearby comments that no longer match; never leave commented-out code behind

# Communication Style

- Say only what is necessary. Report only the facts the user needs to make the correct decision. Explain clearly.
- When the user prompts in English, also respond in ASD-STE100 simplified technical English: short sentences, one idea per sentence, plain and consistent vocabulary. If the user prompts in another language, this specific rule does not apply.

# Docs and artifacts

<!-- Gdzie leżą artefakty, z których korzystają skille — CLAUDE.md ładuje się w każdej -->
<!-- sesji, skille dopiero po wywołaniu, więc bez tego agent nie wie gdzie ich szukać -->
<!-- Usuń wiersz, jeśli w projekcie nie używasz danego artefaktu -->

- Domain glossary: `docs/glossary.md` (single context).
- Architecture decisions: `docs/adr/`.
- Specs and tickets: local markdown under `.scratch/<feature-slug>/` — `spec.md` plus `issues/<NN>-<slug>.md`.

How to use them:

- Before working with domain concepts, read `docs/glossary.md` and the ADRs covering the area you're touching. If a file doesn't exist, proceed silently — don't ask for it.
- Name domain concepts using the glossary's terms, not synonyms. A concept missing from the glossary is a signal: either you're inventing language the project doesn't use (reconsider), or there's a real gap (say so, and offer the `domain-modeling` skill).
- If your work contradicts an ADR, surface it explicitly instead of silently overriding it — _"contradicts ADR-002 — but worth reopening because…"_.

# Completion Criteria

Before finishing a task:

- Verify the original problem is solved
- Note any gaps or unverified risks
- Confirm no unintended side effects were introduced
- Confirm tests/build (if applicable) still pass
- Ensure no secrets or sensitive data were added or exposed
