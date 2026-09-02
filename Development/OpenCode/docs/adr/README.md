# Architecture Decision Records

This folder contains Architecture Decision Records (ADRs) documenting significant technical decisions made in this project.

## When to Write an ADR

All three must be true:

1. **Hard to reverse** — changing your mind later has a meaningful cost
2. **Surprising without context** — a future reader will wonder "why on earth did they do it this way?"
3. **Real trade-off** — there were genuine alternatives and you picked one for specific reasons

### What qualifies

- Architectural shape — monorepo, event sourcing, deployment target
- Technology choices with lock-in — database, auth provider, message bus (not every library — only ones that would take a quarter to swap)
- Integration patterns between contexts — events vs. synchronous HTTP
- Boundary decisions — what a context owns, what it references by ID only
- Deliberate deviations from the obvious path — stops the next engineer from "fixing" something intentional
- Constraints not visible in the code — compliance requirements, SLA contracts with partners
- Rejected alternatives when the rejection is non-obvious — otherwise someone will suggest it again in six months

## Template

```markdown
# ADR-XXX: [Short title]

**Status:** Accepted | Proposed | Deprecated | Superseded by [ADR-XXX](./XXX-...)

[1–3 sentences: what's the context, what did we decide, and why.]

## Considered Options _(optional — only if rejected alternatives are worth remembering)_

- Option A — why rejected
- Option B — why rejected

## Consequences _(optional — only if non-obvious downstream effects exist)_

- ...
```

## Index

| ADR | Title | Status | Date |
| --- | ----- | ------ | ---- |

## How to Add an ADR

1. Copy the template above
2. Number sequentially (next: ADR-002)
3. Fill in the required parts only — skip optional sections if they add no value
4. Submit via PR for team review
5. Update the index above
