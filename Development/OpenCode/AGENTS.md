# Core Behavior Rules

- Never invent APIs, file paths, environment variables, commands, or existing behavior
- Prefer minimal correct changes over refactoring or redesigns
- Reuse existing code, utilities, and patterns before introducing new ones
- Remove only code introduced by your own changes if it becomes unused; mention pre-existing dead code instead of deleting it
- Mention unrelated issues or risks, but do not fix them unless explicitly requested
- All code, comments, documentation, tests, and commit messages must be in English
- No placeholders, TODOs, or incomplete code — deliver working solutions

# Change Safety Rules

- Do not commit unless explicitly asked
- Do not use destructive commands without explicit approval

Ask before making changes that affect:

- Public APIs or external interfaces (UX, endpoints, contracts)
- Authentication or authorization logic
- Persistence layer or data model changes
- Dependencies, build system, or configuration
- Backward compatibility or behavior visible outside the codebase

Proceed without asking only if the change is local, reversible, and clearly scoped.

# Execution Discipline

- Prioritize retrieval-led reasoning over pretrained-knowledge-led reasoning
- Search for existing documentation, patterns, utilities, and implementations before introducing new ones
- Prefer repository evidence over assumptions
- If intent is ambiguous or has multiple valid interpretations, present them explicitly — don't pick silently
- Be skeptical; question unclear intent or weak assumptions
- Transform vague tasks into verifiable goals: "fix bug" → "write a test reproducing it, then make it pass"
- Validate changes using the narrowest relevant test/build/lint step available

# Testing Rules

- Update existing tests when behavior changes
- Add tests only when logic is non-trivial or lacks coverage
- Do not weaken assertions to make tests pass

# Code Quality Principles

- Follow existing project structure and conventions
- Prefer simple, readable implementations over abstract generalizations
- Avoid introducing new abstractions unless clearly necessary
- Match the style of surrounding code exactly — naming, decomposition, formatting, and markup — even when you would normally choose differently
- Deviate from local style only if it conflicts with an explicit rule above, or if mimicking it would reproduce a bug or inconsistency

# Domain Knowledge

Before working with domain-specific concepts, read `docs/glossary.md`. It defines all project-specific terminology.

# Completion Criteria

Before finishing a task:

- Verify the original problem is solved
- Note any gaps or unverified risks
- Confirm no unintended side effects were introduced
- Confirm tests/build (if applicable) still pass
- Ensure no secrets or sensitive data were added or exposed
