# OpenSpec Artifact Schema

Defines the structure and format every OpenSpec artifact in this project must follow: which files a change contains, how each is organized, and the formatting rules for requirements, tasks, design documents, Figma links, and test scenarios. For project context, terminology, platforms, and repository wiring, see [CONVENTIONS.md](CONVENTIONS.md).

---

## Change Artifacts

Each change lives in its own directory under `openspec/changes/<change-name>/` and contains:

| File | Purpose |
|---|---|
| `proposal.md` | Why the change exists, scope, affected platforms, assumptions, risks, and open questions |
| `design.md` | Functional, business, and technical decisions needed to deliver the change (see [Design Documents](#design-documents)) |
| `specs/<capability>/spec.md` | Normative requirements and acceptance scenarios per capability |
| `tasks.md` | Implementation task checklist (see [Tasks](#tasks)) |
| `test-scenarios.md` | Manual QA test scenarios (see [Test Scenarios](#test-scenarios)) |
| `tests/` | Automated test scripts when the change introduces or modifies testable behavior |

Only include the files that apply to the change.

### Change Directory Naming

Change names are kebab-case and describe the change in a few words.

A change that corrects broken behavior in something already built MUST be prefixed `fix-`
(e.g. `fix-login-before-signup`). Changes that add or alter intended behavior carry no
prefix — there is no corresponding prefix for new functionality.

Use this test: if the change makes a platform do what the specs already require, it is a fix.
If it changes what the specs require, it is not. A bugfix change therefore normally has no
spec deltas; if it does need a spec delta, the behavior was never specified and the change is
not purely a fix.

The prefix applies to new changes. Existing and archived change names are not renamed to match.

---

## Spec Files

Spec files describe required behavior for a capability. They are not task lists, design documents, or test execution plans.

When a spec covers multiple platforms, split requirements under platform headings (see the platform table in [CONVENTIONS.md](CONVENTIONS.md)) within the same spec file. Only include headings for platforms that are in scope.

Spec files SHOULD include:

- User-visible behavior.
- API behavior visible to consumers.
- Permissions and role-specific behavior.
- Validation rules and error responses.
- Edge cases and unhappy paths.
- Notifications, reporting, audit, or compliance behavior when relevant.
- Cross-platform behavior when multiple platforms are in scope.

Spec files SHOULD NOT include:

- Internal implementation steps.
- Database schema details unless they are part of an external contract.
- Code structure, module names, or framework-specific implementation instructions.
- Manual test execution tables. Use `test-scenarios.md` for those.

---

## Requirement Format

Requirements MUST be testable and written as observable behavior.

- Use `SHALL` or `MUST` for normative statements.
- Use `SHOULD` only for recommended behavior that may have justified exceptions.
- Avoid vague terms such as `easy`, `fast`, `robust`, `seamless`, or `user-friendly` unless paired with measurable criteria.
- Every requirement MUST include at least one scenario.
- Scenario headings MUST use exactly four hashes: `#### Scenario: ...`.
- Scenarios MUST use `WHEN` and `THEN` statements. Add `AND` or `BUT` only when it improves clarity.
- Keep implementation details out of spec requirements unless they are externally observable or contractually required.

Recommended structure:

```markdown
### Requirement: {Short requirement name}
The system SHALL {observable behavior}.

#### Scenario: {Specific condition}
WHEN {trigger or condition}
THEN {observable outcome}
```

---

## Design Documents

Every `design.md` MUST cover the **functional and business requirements** for the change together with the **technical detail needed to implement it**. Data models, API surface, database schemas, routes, module structure, and technology choices belong here rather than being left to be decided during implementation.

Design documents SHOULD include:

- Business goals and non-goals.
- Affected users, roles, and permissions.
- Business logic, workflows, and state transitions.
- UI/UX decisions and behavior, including empty states, errors, loading states, and accessibility expectations.
- Integration points, external dependencies, and ownership boundaries.
- API contracts when relevant, including paths, methods, request/response expectations, status codes, and error handling.
- Data requirements when relevant, including entities, key fields, retention, audit, privacy, and migration needs.
- Security, compliance, performance, monitoring, rollout, and rollback considerations when they affect delivery risk.
- Open questions and assumptions.

Design documents SHOULD NOT include low-value implementation detail that is better decided during development, such as local variable names, private helper functions, or speculative future architecture.

### Referencing code across connected repositories

The code this project documents lives in the repositories listed under [Connected Implementation Repositories](CONVENTIONS.md#connected-implementation-repositories) — normally git submodules of this repository. Before naming any file, module, or component in `design.md`:

- Read that table, then search **inside** those paths. A search from the repository root that ignores them finds documentation and concludes there is no code.
- Write every path repository-qualified: `submodules/backend/src/...`, never a bare `src/...`. The prefix is what tells the implementer which repository to open.
- Group the files a change touches by repository, and when a change spans repositories, state which must land first (a shared contract, an API, a generated client) and what the others depend on.
- **An empty repository path means the submodule is not checked out, not that the code does not exist.** Stop and ask for `git submodule update --init --recursive`. Anything written against an empty directory is invented, and reads afterwards like a grounded design.

### Referencing an existing backend API

When the project defines an API contract as a source of truth (see [CONVENTIONS.md](CONVENTIONS.md)) and a change touches the backend, read that contract and include an `## Existing API Impact` section in `design.md` that, for each backend capability in scope, states one of:

- **Existing** — name the endpoint and data model (e.g. "served by `GET /api/users/{id}`").
- **Existing, needs extension** — name the endpoint/model and the field being added.
- **New** — state that no existing endpoint covers it, having checked the contract first.

Never assume an endpoint, model, or field is new without checking the contract first. Where a *new* endpoint is needed, specify its shape too — path, method, and payload.

---

## Figma Links

### In spec files

Every frontend or mobile spec file MUST include a Figma link at the top of the file as a blockquote: `> Figma: {screen or flow label} - {url}`.

**Never invent, guess, reuse, or carry over a Figma URL from another change.** Before generating a frontend or mobile spec file, ask the user for the Figma link for that specific screen or capability. If no Figma file exists, state that explicitly at the top: `> Figma: Not available - confirmed by {source/date}`.

### In design.md

Every `design.md` MUST include a `## Figma` section listing all Figma files relevant to the change, one per line as a blockquote (e.g. `> Figma: {label} - {url}`). If the change spans multiple screens, flows, or platforms, include a short label for each file. If no Figma files apply (e.g. backend-only changes), include the section with `No Figma files apply to this change.`

```markdown
## Figma

> Figma: Admin user list - https://figma.com/...
> Figma: User details drawer - https://figma.com/...
```

---

## Tasks

Tasks live in a single `tasks.md` file at the root of the change directory, alongside the other change artifacts.

Rules:

- Each task must be a checkbox using `- [ ] X.Y` format.
- Order tasks by dependency — shared infrastructure and backend tasks before platform-specific tasks. Across connected repositories this is stricter, not looser: a consumer cannot be built against a contract that has not landed, so the producing repository's tasks come first and the consuming task states what it waits on.
- When a change spans multiple platforms, group tasks under platform headings (see the platform table in [CONVENTIONS.md](CONVENTIONS.md)), and only include a heading for a platform that is actually in scope. Name the platform's repository path in its heading (e.g. `## Frontend (submodules/frontend)`).
- Every path a task names — in its title, its `Scope`, or its acceptance criteria — is repository-qualified (`submodules/backend/src/...`), so no one has to guess which checkout the task belongs to. See [Referencing code across connected repositories](#referencing-code-across-connected-repositories).
- Shared infrastructure tasks that affect multiple platforms are listed under each affected platform's heading, phrased from that platform's perspective.
- **Never include testing, QA, or verification tasks in `tasks.md`** — test scenarios belong in `test-scenarios.md`, and execution is handled by the development team independently.
- Write tasks so that an AI agentic implementation system and a human developer understand them equally well.

Each task SHOULD:

- Be small enough for a human developer to complete in less than 90 minutes.
- Affect one primary component or concern.
- Include explicit acceptance criteria.
- Include explicit dependencies when task order matters.
- Reference the relevant requirement, scenario, design section, or API contract.

```markdown
- [ ] {Task title}
  - Scope: submodules/{repo}/{component or file area}
  - Acceptance criteria: {observable completion criteria}
  - Dependencies: {none / task ID / external dependency}
```

---

## Test Scenarios

Every change that introduces or modifies behavior MUST include one `test-scenarios.md` file at the root of the change directory (alongside `tasks.md`). This file contains manual test scenarios for QA. A template is available at `openspec/schemas/spec-driven/templates/test-scenarios.md`.

Rules:

- One `test-scenarios.md` per change, not one per spec.
- Group scenarios by feature area with a heading per group.
- Use a table with these columns: `#`, `Scenario`, `Steps`, `Expected Result`.
- Number scenarios sequentially across the file (`T1`, `T2`, `T3`, ...).
- Cover all platforms and backend flows in scope for the change.
- Write scenarios from a manual tester's perspective — only behavior observable through the UI, API responses, notifications, files, reports, or logs available to testers. Never describe internal service-to-service payloads, private database state, or implementation details a tester cannot see.
- Do not duplicate full requirement text; translate requirements into executable test scenarios.

```markdown
## {Feature area}

| # | Scenario | Steps | Expected Result |
| --- | --- | --- | --- |
| T1 | {Scenario name} | 1. {Step one}<br>2. {Step two} | {Expected observable result} |
```

---

## Automated Tests

Every behavior-changing change SHOULD include automated test scripts in a dedicated `tests/` folder when the change includes implementation.

- Choose the test framework the repository already standardizes on; otherwise use the project's default.
- Write the tests inside the platform's own connected repository, following that repository's existing test layout — never in a `tests/` folder at the root of this documentation repository.
- Create automated tests for the scenarios in `test-scenarios.md` where automation is practical.
- Name test files so they can be traced back to scenario IDs where possible.
- Do not block documentation completion on automation when the project phase only requires planning artifacts.
- If a scenario cannot reasonably be automated, document the reason in `test-scenarios.md` or the relevant test notes.

---

## Assumptions, Risks, and Open Questions

Every proposal and design document SHOULD separate confirmed facts from assumptions and open questions.

- Use `## Assumptions` for decisions made to keep the work moving.
- Use `## Risks` for uncertainty that may affect scope, timeline, compliance, reliability, or user adoption.
- Use `## Open Questions` for decisions that require stakeholder input.
- Do not hide major unresolved decisions inside requirement text.
- If an open question materially changes scope or implementation effort, call it out before generating final tasks.
