---
name: discovery-questions
description: Build a prioritized, time-boxed discovery question list for a proposed feature, sized to fit a real client meeting and structured so the answers can later be cross-checked automatically.
argument-hint: "<feature description or @path/to/brief.md> [| audience: business|mixed|technical] [| meeting: 60m] [| lang: en|pl]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write
---

# Discovery Questions

Prepare a question set for a client discovery meeting about the feature described in the input. The answers must be sufficient to describe the change accurately afterwards, without guessing.

Input:

$ARGUMENTS

## 0. Parse the input

The input may be prose, a file path, or both, plus optional `key: value` options separated by `|`.

- If a path or `@file` is given, read it. If a folder is given, read the discovery documents inside it.
- Options and defaults: `audience: mixed`, `meeting: 60m`, `lang: en` (language of the questions; internal artifacts stay in English).
- If the feature description is too thin to produce meaningful questions (under ~2 sentences and no reference material), do not pad it out with generic questions. Say what minimum context you need and stop.

## 1. Ground yourself before writing questions

Do not ask the client what you can already find out. In order:

1. If the repo has existing specifications (for example under `openspec/specs/`), skim anything that touches this feature. Read only — anything already specified is context, not a question.
2. Check for earlier discovery documents, meeting notes, or a prior cross-check with unresolved questions. Carry forward every unresolved blocker.
3. Note what you found in `## What We Already Know` so the analyst does not burn meeting time re-confirming it.

## 2. Prefer confirmations over open questions

This is the single biggest lever on meeting throughput. For anything where a sensible default exists, do not ask an open-ended question. State the default and ask the client to confirm or correct it.

- Weak: "How long should records be kept?"
- Strong: "We plan to keep archived records visible for 12 months and then hide them from the default view. Does that work for you?"

Open questions are for genuine business decisions only: goals, priorities, money, who decides, what the client's own process actually is. Anything else becomes a proposed default in `## Assumptions To Confirm`.

## 3. Size the set to the meeting

Budget roughly 2.5 minutes per substantive question including the client's digressions, and reserve 20% of the meeting for the client's own agenda.

- 30m → 8–10 Must-ask, 12 total
- 60m → 16–20 Must-ask, 30 total
- 90m → 24–30 Must-ask, 45 total

Never exceed the total. If coverage does not fit, cut the lowest-value topics and list them under `## Deferred To A Second Session` rather than quietly dropping them or shrinking every question into a compound one.

## 4. Coverage areas

Cover these, skipping any that genuinely do not apply (say which you skipped and why):

1. **Business outcome** — what changes for the business when this ships, how success is measured, what happens if nothing is built
2. **Users and responsibility** — who does the work today, who is allowed to do what, who signs off, who is accountable when something goes wrong
3. **Current process** — how this is handled today, including the spreadsheet or email workaround; what must keep working
4. **Core journey** — the normal path, start to finish, in the client's own words
5. **Information used and produced** — what people need to see to make a decision, what they type in, what they send onward
6. **Rules and exceptions** — what is not allowed, what needs approval, what happens when the unusual case occurs
7. **Other systems and people outside the team** — where data comes from and goes, who else touches it, what is the source of truth on conflict
8. **Being told and being able to prove** — notifications, reports, exports, and what must be reconstructable after the fact
9. **Scale, timing, and pain thresholds** — in business units ("how many per day", "how long before someone complains"), never in technical metrics
10. **Data sensitivity and obligations** — what kind of data this is, whether it is personal or health-related, who may see it, where it may live, any audit or regulatory obligation the client already operates under
11. **Rollout and the existing pile** — what happens to existing records, who configures it, training, phased or big-bang
12. **Done and paid** — what the client would check to accept it, what is explicitly out of scope, budget or deadline constraints that shape the choices

For a medtech, fintech, or otherwise regulated client, area 10 is always Must-ask and always includes the audit-trail question, even when the client has not raised compliance.

## 5. Question quality rules

- One question per question. Split anything containing "and" that asks for two decisions.
- Situational, not abstract: "What should happen when two people edit the same record?" beats "What are the concurrency requirements?"
- No jargon: no schemas, APIs, permissions models, architectures, SLAs, or entities. Ask about visible behavior, responsibility, risk, and money.
- No leading questions and no answers embedded in the question, except in the confirm-the-default form, where the proposal is deliberate and marked as such.
- Ask about the exception, not just the happy path. Most missing requirements live there.
- Adjust register to `audience`: for `technical`, you may name systems, formats, and existing integrations directly; still ask about behavior and ownership rather than implementation.
- Add a follow-up only where the answer genuinely branches into different requirements, and say what each branch implies.

## 6. IDs and marking

Number questions `Q-01`, `Q-02`, … sequentially across the whole document, in output order. Number assumptions `A-01`, `A-02`, …. These IDs are stable and are reused verbatim by the cross-check step, so never renumber them in later revisions — append instead.

Mark a Must-ask question inline, in the question line itself: `**Q-01 [Must ask]** <question>`. There is no separate list of them — the analyst reads down one list during the meeting and should see the priority without cross-referencing. Within each topic, put the Must-ask questions first, so a meeting that runs short degrades gracefully.

## Output format

Produce exactly these sections, in this order, and no others.

```
# Discovery Questions: <feature title>

Meeting: <length> | Audience: <audience> | Must-ask: <n> | Total: <n>

## Context Summary
<3-6 sentences: what the client appears to want and why, in product language>

## What We Already Know
- <fact taken from existing specs, notes, or the brief — with its source>

## Assumptions To Confirm
- A-01 [<topic>] We will assume <default>. <one line on why, or the consequence if wrong.>

## Questions

### <Topic>
- **Q-01 [Must ask]** <question>
- Q-02 <question>
  - If <branch A>: <follow-up>
  - If <branch B>: <follow-up>

## Deferred To A Second Session
- <topic and why it was cut>

## Pre-Read Request
- <document, sample, access, or existing report to request before the meeting>

## Readiness Checklist
Before this feature can be described as a scoped change, these must be known:
- [ ] <item> (answered by Q-xx / A-xx)
```

Write the file to `docs/discovery/<feature-slug>/questions.md`, or wherever this repo keeps discovery notes. Do not write into `openspec/` — that directory holds OpenSpec's own artifacts. If there is no obvious place, return the Markdown inline, without code fences.

## Before returning, check

- The Must-ask count in the header matches the number of questions marked `[Must ask]`, and that count fits the meeting budget.
- Within every topic, Must-ask questions come before the rest.
- No question can be answered from `## What We Already Know`.
- No question contains a technical term the client would have to look up.
- Every readiness checklist item traces to a specific Q or A ID; if something on the list is not covered by any question, add the question.
- The total does not exceed the budget for the meeting length.
