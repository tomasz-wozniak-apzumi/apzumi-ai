# Project Conventions

Per-project facts, terminology, and repository wiring for everyone (humans and
AI agents) working on specs in this project.

Artifact **structure and format** (requirement format, tasks, tests,
Figma policy, platform sections) is NOT defined here — it lives in the shared
schema at `openspec/schemas/apzumi-sdd/` and is injected automatically when
artifacts are created. This file holds only what is specific to this project.

**This file is the single source of truth** for the platform names, the
Capability Map, approved terminology, repository wiring, and API procedure
below. `config.yaml`'s
`context` block deliberately does NOT repeat them — it points here instead, so
the two cannot drift apart. Short project facts (stack, testing, lint) live in
`config.yaml`; everything below lives only here.

---

## Platform Architecture

<!-- List the project's platforms. These names are used VERBATIM as section
     headings in specs and tasks — never invent variations. Delete rows that
     don't apply. Mark which platforms are UI-facing: the schema requires a
     confirmed Figma link on every spec covering one. -->

| Platform | Stack | UI? | Notes |
|---|---|---|---|
| Frontend | `<Angular / React / ...>` | yes | `<admin panel / customer portal / ...>` |
| Backend | `<Java / Node.js / Python / ...>` | no | `<API / integration service / ...>` |
| Mobile iOS | `<Swift / ...>` | yes | |
| Mobile Android | `<Kotlin / ...>` | yes | |
| Shared infrastructure | `<AWS / Terraform / ...>` | no | `<only when infra is affected>` |

---

## Capability Map

<!-- The agreed capability taxonomy for this project: the domains specs are
     organised into. Fill this in at setup, before the first change.

     This is INTENT, not a record of what exists. `openspec list --specs` shows
     which of these have specs yet — on a new project that list is empty while
     this table is already full, and that is the point: it gives the first
     changes a taxonomy to target instead of each one inventing its own.

     Naming rules:
     - A capability is a cohesive area of behaviour, not a technical layer:
       `patient-records`, not `database`; `notifications`, not `email-service`.
     - Coarse and domain-level (`billing`, `auth`) beats feature-level
       (`billing-export`, `auth-mfa`). One capability holds many requirements.
     - kebab-case. Use a nested path (`identity/user-auth`) only if the project
       genuinely needs a domain level; a flat layout is the default.
     - 4-8 entries is typical. If you cannot say in one line what a domain
       covers, you do not understand it well enough to name it yet.

     Do NOT write requirements here. Requirements reach `openspec/specs/` only
     by passing through a change and its review gate. This table names the
     folders they will land in, nothing more. -->

| Capability | Covers |
|---|---|
| `<capability-path>` | `<one line: what behaviour lives here>` |

Adding a capability that is not in this map is a signal, not a sin: extend the
map in the same change that introduces it, so the taxonomy stays a deliberate
decision rather than an accident of whoever wrote the proposal.

---

## Terminology

<!-- Approved business terms. AI agents follow this table in every artifact. -->

| Use | Never use | Notes |
|---|---|---|
| `<approved term>` | `<deprecated term>` | `<when and why>` |

If a term is ambiguous, define it in the relevant artifact before using it in
requirements.

---

## Connected Implementation Repositories

<!-- How the code this documentation describes is reachable from this repo.
     Delete this section if the code lives in the same repository.

     Example (git submodules):

     | Platform | Path |
     |---|---|
     | Frontend | `submodules/frontend` |
     | Backend | `submodules/backend` |

     When implementing tasks under a platform heading, make the code changes
     inside that platform's path. Never edit directly on a submodule's default
     branch; committing, pushing, and opening PRs are separate explicit steps.
     Note any platform whose working branch is not the default (e.g. backend
     uses `develop`, not `master`). -->

---

## Backend API Reference

<!-- Where the authoritative API contract lives and when to read it. Delete
     this section if the project has no external contract.

     Example (live OpenAPI doc as source of truth):

     | Platform | OpenAPI URL |
     |---|---|
     | Backend | `https://<host>/v3/api-docs/api` |

     Reading the API is mandatory, not advisory, at three points:
     1. Before writing backend requirements in design.md or a spec file.
     2. Before generating tasks.md — every backend task must name the endpoint
        or DTO it touches and be marked MODIFY (exists) or NEW (absent).
     3. Before implementing a backend task — re-read to confirm exact endpoint
        paths, DTO class names, and field names; reuse them verbatim.

     Record the outcome in design.md under "## Existing API Impact".

     If a task is marked NEW but the API shows it already exists, stop and
     report the contradiction rather than implementing it.

     The documents can be large — fetch and filter rather than reading whole.
     If the API doc and the code disagree, the code wins (the deployed doc may
     lag unmerged work). -->

---

## Figma

<!-- Project-specific Figma organisation: team/project links, file naming,
     who confirms links. The org-wide policy (every UI spec needs a confirmed
     link; never invent URLs) is enforced by the schema — record here only
     where designs live for THIS project. -->
