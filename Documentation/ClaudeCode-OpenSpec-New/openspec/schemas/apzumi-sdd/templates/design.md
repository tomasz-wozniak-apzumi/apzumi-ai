# Design: <change name>

<!-- Ground every section in the REAL codebase — inspect it first. Short
     bullets over prose; a developer should parse any section in under a
     minute. Reference requirements, don't restate them. -->

## Context & Constraints
<!-- The relevant existing architecture this change lands in, and the hard
     constraints on it: performance budgets, backwards-compat, security,
     regulatory. Ground this in real modules, not generalities. -->

## Approach
<!-- The chosen technical strategy, in prose. Name the real components involved. -->

## API Surface
<!-- Each endpoint/contract to CREATE or CONSUME.
     HTTP:      METHOD /path — request shape — response shape — status codes.
     Internal:  module path — function signature — what it returns/raises.
     Include contracts you consume from other services too. -->

## Existing API Impact
<!-- Only when the project has an external API contract (e.g. an OpenAPI doc
     named in the project context). Read it first, then state per backend
     capability:
     - Existing               — served by <endpoint> → <DTO>
     - Existing, needs extension — <endpoint>/<DTO>, field being added
     - New                    — no existing endpoint covers it (checked)
     Naming what exists is a fact, not a design decision. Never assume an
     endpoint, DTO, or field is new without checking. -->

## Data Model & Migrations
<!-- Models / tables / types ADDED or CHANGED. The migration outline. Any
     backfill or dual-write step. Indexes affected. -->

## Modules & Files
<!-- Be explicit.
     CREATE:  path/to/new_file        — purpose
     MODIFY:  path/to/existing_file   — what changes and why -->

## Integration Points
<!-- External services, events/queues published or consumed, third-party APIs,
     feature flags, config/secrets required. -->

## Flow
<!-- A short numbered sequence (or a small diagram) for any cross-module or
     async interaction. Enough that the implementer knows the call order. -->

## Test Identifiers
<!-- REQUIRED when a UI platform is in scope; delete otherwise.
     The exact, stable id for every element the acceptance scenarios touch:
       Web:      data-testid="<feature>-<element>"
       iOS:      accessibilityIdentifier = "<feature>.<element>"
       Android:  resource-id / contentDescription = "<feature>.<element>"
     Give the literal strings, not a naming policy. The generated E2E tests are
     written against these BEFORE the UI exists, so an id the implementer
     invents later silently breaks the test. Never derive an id from copy,
     position, or a generated class name. -->

| Element | Platform | Identifier |
|---|---|---|
| <what it is> | <platform> | `<exact id>` |

## Testing Strategy
<!-- The two layers, kept disjoint:
     Layer 1 — Acceptance / E2E: generated from tests.md by
       @apzumi-generate-test-code. Say which scenarios, on which platform.
     Layer 2 — Unit & integration: hand-written, from the spec scenarios and
       the design below. Only what E2E cannot reach — pure-function edge cases,
       internal error branches, boundary values, resource handling.
     Anything layer 1 asserts should not be re-asserted by layer 2. -->

## Decisions & Trade-offs
<!-- ADR-style, one block per decision:
     Decision:      what was chosen
     Alternatives:  what else was considered
     Why:           the reasoning
     Consequences:  what this locks in or rules out later
     This section is the durable value of design.md — keep it substantive. -->

## Risks & Mitigations
<!-- What could go wrong, and the specific guardrail for each. -->

## Figma
<!-- One blockquote per relevant Figma file, with a short label:
     > Figma: <screen or flow label> — <url>
     Never invent or guess a URL — ask for missing ones. If none apply:
     "No Figma files apply to this change." -->

## Assumptions
<!-- Things you took as true without confirming, that a reader needs in order
     to judge this design. Distinct from Open Questions: an assumption is a
     decision you made and moved on from; an open question is still open.
     Delete this section if there are none. -->

## Open Questions
<!-- STRICT BAR: only genuinely deferrable unknowns — things that can be
     answered later WITHOUT changing the specs, the approach, or the task
     breakdown. This is not a parking lot for decisions you skipped: if a
     question would change any of those three, resolve it now (ask the user)
     rather than recording it here.
     What always belongs here: anything you could NOT ground in a real file or
     contract. Better an explicit open question than an invented path.
     Delete this section if there is nothing to record. -->
