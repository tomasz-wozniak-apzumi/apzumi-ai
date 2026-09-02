---
name: to-spec
description: Turn the current conversation into a spec and publish it under `.scratch/` — no interview, just synthesis of what you've already discussed. Use after a grilling/design session to capture the agreed feature as a spec.
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a spec. Do NOT interview the user — just synthesize what you already know. Grill first with `/grill-with-docs` if the design isn't settled yet.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's `docs/glossary.md` vocabulary throughout the spec, and respect any ADRs in `docs/adr/` that touch the area you're changing.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

Check with the user that these seams match their expectations.

3. Write the spec using the template below, then publish it to `.scratch/<feature-slug>/spec.md` (create the directory if needed). Record `Status: ready-for-agent` near the top — the spec is agent-grabbable by construction, so no further triage is needed.

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Requirements

A numbered list of functional requirements, each with a stable ID:

- **FR-001**: The system MUST <behavior>
- **FR-002**: The system SHOULD <behavior>

Use MUST for non-negotiable behavior, SHOULD for important-but-flexible behavior. Every requirement must be testable — "fast" is not testable, "responds in < 500ms p95" is. If something genuinely wasn't settled in the conversation, mark it inline as `[NEEDS CLARIFICATION: <the ambiguity>]` — at most 3 markers in the whole spec; more than that means the design isn't settled and you should grill instead of publishing.

## Success Criteria

A numbered list of measurable outcomes that show the feature works, each with a stable ID:

- **SC-001**: <measurable outcome>

FR/SC IDs are load-bearing: tickets declare which IDs they deliver, and `/full-code-review` checks conformance against them.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- The test seams agreed in step 2 — name each seam explicitly, so a fresh implementation session can find them without this conversation
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this spec.

## Further Notes

Any further notes about the feature.

</spec-template>
