---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, or when another skill needs to maintain the domain model.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the _active_ discipline — challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely _reading_ `docs/glossary.md` for vocabulary is not this skill — that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

## File structure

Most repos have a single context:

```
/
├── docs/
│   ├── glossary.md
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

If a `docs/glossary-map.md` exists, the repo has multiple contexts. The map points to where each one lives:

```
/
├── docs/
│   ├── glossary-map.md
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── glossary.md
│   │   └── docs/adr/                 ← context-specific decisions
│   └── billing/
│       ├── glossary.md
│       └── docs/adr/
```

Create files lazily — only when you have something to write. If no `docs/glossary.md` exists, create one when the first term is resolved. If no `docs/adr/` exists, create it when the first ADR is needed.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `docs/glossary.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y — which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account' — do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible — which is right?"

### Update the glossary inline

When a term is resolved, update `docs/glossary.md` right there. Don't batch these up — capture them as they happen. Use the format in [GLOSSARY-FORMAT.md](./GLOSSARY-FORMAT.md).

`docs/glossary.md` should be totally devoid of implementation details. Do not treat `docs/glossary.md` as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.

### Offer ADRs sparingly

Before offering, **check the decision against the `adr` skill's** "When an ADR is warranted" criteria and "What qualifies" list — don't rely on memory or a paraphrase, re-read them. A decision that fails any of the three criteria, or doesn't match the qualifying list, isn't an ADR — offering anyway is how the wrong things end up as ADRs. When it does qualify, use the `adr` skill to write it.
