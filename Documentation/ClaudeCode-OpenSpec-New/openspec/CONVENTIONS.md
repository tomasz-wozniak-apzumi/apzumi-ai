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

## Test Automation

<!-- The wiring between a platform, the framework that tests it, and where that
     code lives. Fill this in at setup; delete rows that do not apply.

     This table is load-bearing, not documentation. tests.md groups scenarios by
     capability while tasks.md groups tasks by platform, so a row's `Platforms`
     cell plus this table are what tell the generation task under a platform
     which scenarios are its own and which runner to write them for. The
     conventions checker reads it: the framework named here is what a tester's
     `Decision` value must match.

     A platform with no framework is a legitimate row — say so explicitly, with
     the consequence. "No stack" recorded here turns a scenario needing that
     platform into a blocker someone sees, rather than a test nobody wrote. -->

| Platform | Framework | Test root | Runner | Notes |
|---|---|---|---|---|
| `<Platform>` | `<framework>` | `<path/to/tests>` | `<command>` | `<preconditions, cost, anything a runner needs>` |
| `<Platform>` | — | — | — | `<why there is no stack, and what that means for scenarios needing it>` |

Runtime detail — roots, runners, preflight, forbidden patterns — belongs in the
project's automation config, and product facts (URLs, credentials, seeds) in its
QA config. This table is the contract; those files are the configuration.

**Execution policy.** State plainly when tests run: on demand, on a schedule,
never per push. Say what a run costs where it costs something — paid device
minutes are the usual case — because that cost is why the policy exists. Say
where a run's result is committed, since a result that only lives in an
expiring CI artifact cannot answer "was this tested, and when".

---

## Identifier Policy

**`policy: owned`**

<!-- One of two values. This is the single most consequential line in this file
     for how the flow behaves when a test cannot address a control, so choose it
     deliberately rather than leaving the default.

     owned  — we can change the product. A control with no stable identifier is
              a DEFECT: the generator stops and reports it, and somebody adds
              the identifier. This is the right setting for a product the team
              owns, and it is what makes the flow improve the product instead of
              working around it.

     legacy — we cannot change the product, or not on this timescale. The
              generator falls back down the ladder below and records the debt.
              Choose this for a third-party or frozen application, never as a
              way to avoid a conversation about identifiers. -->

### The fallback ladder

Only under `policy: legacy`. Each rung costs something, and the cost is stated
so nobody picks one without knowing:

| Rung | When | What you lose |
|---|---|---|
| the identifier contract | always preferred | — |
| role + accessible name | no id, but the semantics are there | breaks on a language switch |
| visible text | last resort | breaks on a copy edit **and** on a language switch |
| **no sound rung** | — | **still a blocker** |

The last row is the important one. Some things no fallback reaches: whether a
chip is *selected* cannot be read from its label, and neither can the order of a
list. A missing identifier there is a blocker under either policy, and saying so
is the honest answer.

### Recording the debt

A fallback that only lives in a code comment reaches nobody. Every fallback
locator carries the marker

```
@locator-fallback <element> — <rung> — <why no identifier>
```

and the change's `design.md` carries a matching row under `## Identifier Debt`,
with an owner. The conventions checker fails the build when a marker has no row,
and when a marker appears at all under `policy: owned`.

The point is not paperwork. It is that a team which flips this switch to avoid a
conversation ends up with a list that grows in front of them, rather than with
silence.

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
