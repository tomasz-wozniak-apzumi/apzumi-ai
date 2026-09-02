# OpenSpec Conventions

Project-specific context, terminology, platforms, and repository wiring for all specs in this project. All contributors and AI agents working on specs should follow these rules.

For the structure and format of artifacts (spec files, requirements, tasks, design docs, Figma links, test scenarios), see [SCHEMA.md](SCHEMA.md).

> Fill in the placeholders below (written as `{...}`) when setting up a new project, and delete any sections that do not apply.

---

## Platform Architecture

Every change MUST explicitly state which platforms are in scope. If a platform is not affected, do not create requirements or tasks for it. List the project's platforms here and always use these exact labels — never invent variations.

| Platform label | Stack | Scope notes |
| --- | --- | --- |
| Frontend | `{Angular / React / Vue / other}` | `{Admin panel, customer portal, public website, etc.}` |
| Backend | `{Java / Node.js / Python / .NET / other}` | `{API, orchestration layer, integration service, domain service, etc.}` |
| Shared infrastructure | `{AWS / Terraform / Cognito / CI/CD / other}` | `{Only include when infrastructure or shared services are affected.}` |

Add or remove rows so the table matches the real platforms. Use the exact platform names from this table as the section headings in spec files and `tasks.md` (see [SCHEMA.md](SCHEMA.md)).

---

## Terminology

Use approved business terminology consistently across proposals, specs, design documents, tasks, and test scenarios. If a term is ambiguous, define it in the relevant artifact before using it in requirements.

| Use | Do not use | Notes |
| --- | --- | --- |
| `{Approved term}` | `{Deprecated term}` | `{When and why to use it}` |
| `{Role name}` | `{Ambiguous role name}` | `{Permissions or responsibility notes}` |
| `{Business event}` | `{Informal phrase}` | `{Definition}` |

---

## Connected Implementation Repositories

This is a documentation repository. The code it describes lives in separate repositories, attached here as **git submodules** under `submodules/<platform-slug>/`, so a single checkout gives every artifact — and everyone writing one — the real code of every platform.

Fill this table in at setup with `/link-repos`, which adds the submodules and writes these rows together. `node scripts/check-repos.mjs --validate` fails when the table and `.gitmodules` disagree.

| Platform | Path | Repository | Working branch | Notes |
| --- | --- | --- | --- | --- |
| `{Platform label}` | `submodules/{platform-slug}` | `{git@host:org/repo.git}` | `{branch}` | `{e.g. planned — repo not created yet}` |

Use the exact platform labels from the Platform Architecture table above. `Path` is relative to this repository's root, and is the prefix every file path in an artifact carries. Record the working branch even when it is the default. A platform whose repository does not exist yet still gets a row: leave `Path` empty and say `planned` in `Notes`.

If the code lives in *this* repository, replace the whole table with the single line `None — the code lives in this repository.`

### Working with connected repositories

- Get the code: clone this repository with `--recurse-submodules`, or run `git submodule update --init --recursive` in an existing clone.
- **An empty repository path means the submodule is not checked out — never that the codebase is empty.** Stop and initialise it rather than writing a design or tasks against nothing.
- Paths in artifacts are repository-qualified: write `submodules/backend/src/...`, never a bare `src/...`. A path with no repository in it stops identifying a file the moment the project has more than one.
- When implementing a task under a platform heading in `tasks.md`, make the code changes inside that platform's path above.
- A submodule checkout sits on a detached HEAD after init. Check out the working branch listed above before making any commit inside one, or the commit is lost on the next update.
- Committing, pushing, opening a PR, and bumping this repository's submodule pointer are separate explicit steps — never side effects of implementing a task.
- Run a repository's tests from inside that repository, with its own runner.

---

## API Reference

> Optional — include only when the project has an API contract that acts as a source of truth (e.g. Swagger/OpenAPI, a schema registry, or a published contract).

State where the contract lives and treat it as the source of truth:

| Platform | Contract location |
| --- | --- |
| `{Backend / API service}` | `{URL or path to the OpenAPI/Swagger doc or contract}` |

### When to read it

Reading the contract is mandatory, not advisory, at three points:

1. **Before writing backend requirements** in `design.md` or a spec file — confirm whether each endpoint, model, and field already exists.
2. **Before generating `tasks.md`** — every backend task must name the endpoint or model it touches and be marked `MODIFY` (already exists) or `NEW` (absent).
3. **Before implementing a backend task** — re-read the contract to confirm exact endpoint paths, model names, and field names before writing code, and reuse them verbatim.

Never assume an endpoint, model, or field is new without checking. If a task is marked `NEW` but the contract shows it already exists, stop and report the contradiction rather than implementing it. Record the outcome in `design.md` under `## Existing API Impact` (see [SCHEMA.md](SCHEMA.md#referencing-an-existing-backend-api)).

If the contract and the platform code disagree, the code wins — the published contract may lag unmerged work.
