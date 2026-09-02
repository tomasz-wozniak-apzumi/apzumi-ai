---
name: adr
description: Use this skill whenever the user wants to create, review, or update an Architecture Decision Record (ADR). Also use when the user describes a technical decision they just made and you think it qualifies for an ADR.
---

# ADR

A skill for creating and maintaining Architecture Decision Records.

## When an ADR is warranted

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

If the user describes a decision that doesn't meet the criteria, tell them why and suggest skipping the ADR.

## Workflow

### 1. Assess

If the user just describes a decision (without explicitly asking for an ADR), first check the three criteria above. If it doesn't qualify, say so briefly. If it does — or if they explicitly asked — proceed.

### 2. Gather context

Ask only what's missing. You need:

- What was decided and why
- What alternatives were considered (if any)
- Any non-obvious consequences

Don't ask for things you can already infer from the conversation.

### 3. Write the ADR

File: `docs/adr/NNN-slug.md` — scan existing files to find the next number.

```markdown
# ADR-NNN: [Short title]

**Status:** Accepted

[1–3 sentences: what's the context, what did we decide, and why.]

## Considered Options _(only if rejected alternatives are worth remembering)_

- Option A — why rejected
- Option B — why rejected

## Consequences _(only if non-obvious downstream effects exist)_

- ...
```

Keep it short. The body can be a single paragraph. Resist adding sections just to fill them out.

### 4. Update the index

Add a row to the index table in `docs/adr/README.md`:

```markdown
| [NNN](./NNN-slug.md) | Short title | Accepted | YYYY-MM-DD |
```

If the README doesn't exist yet, create it using the project's ADR README template.
