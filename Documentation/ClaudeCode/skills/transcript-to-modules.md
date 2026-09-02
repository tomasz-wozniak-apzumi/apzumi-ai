---
name: transcript-to-modules
description: Turn a client meeting transcript into change-sized feature modules with evidence-backed decisions, assumptions, and blocking questions — the brief that OpenSpec later turns into a change.
argument-hint: "<transcript text or @path/to/transcript.md> [| feature: <slug>] [| prior: @path/to/previous-modules.md]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write
context: fork
---

# Transcript To Modules

Meeting transcript:

$ARGUMENTS

Extract the product changes the client wants, each scoped so it can be handed to OpenSpec as a single change.

This skill does not write specifications. It produces the description OpenSpec works from: what the change is for, who uses it, what should happen, what is decided, what is assumed, and what is still unknown. Requirement wording, delta specs, scenarios, and task breakdown are OpenSpec's job — leave them alone.

## 0. Read the transcript properly first

- If a path is given, read the file. Read all of it before writing anything.
- Transcripts are noisy. Machine transcription mangles product names, numbers, and negations. Where a passage is garbled but load-bearing, quote it and flag it under the module's open questions rather than guessing what was meant.
- If `prior:` is supplied, treat it as the baseline: reuse its module IDs, mark what changed, and do not silently drop a module that stopped being mentioned — move it to `## Parking Lot` with a note.

## 1. What counts as a module

One module is one coherent capability change that a pair could take through to implementation without waiting on a different module.

Split when:
- it covers more than one clearly separate area of the product,
- the workflows have different users with different permissions,
- one part is agreed and another is still an argument,
- it is large enough that two people would work on halves of it in parallel.

Merge only when the parts cannot be described independently — for example, a form and the record it writes, where neither is meaningful alone.

Not a module: a stated preference with no behaviour attached, a complaint about the current system with no requested change, a technology opinion, anything the client explicitly ruled out. Those go to `## Parking Lot` or `## Explicit Non-Goals`.

## 2. Evidence discipline

- Every entry under `Confirmed Decisions` needs an anchor: speaker plus timestamp if the transcript has them, otherwise a short quote. Quotes stay under 15 words; paraphrase everything longer.
- A decision is confirmed only when the client stated it. Something the analyst proposed and the client did not reject is an assumption, not a decision. So is anything the client's own team disagreed about on the call.
- Never present a paraphrase as a quote.

## 3. Describe behaviour in the client's terms

Behaviour goes under `Expected Behaviour` as plain, concrete statements of what should happen, in the language the client would recognise. The test is whether someone who was not in the meeting could read the line and tell whether the built system does it or not.

- Concrete: "A nurse can hand over an unfinished note to the next shift, and the receiving nurse sees who wrote it and when."
- Too vague to use: "Handover should be smooth."
- Not this skill's job: requirement keywords (SHALL/MUST), GIVEN/WHEN/THEN scenarios, acceptance criteria formatting, requirement numbering. OpenSpec produces those from what you write here.

Keep implementation out entirely: no class names, libraries, table designs, endpoints, or framework choices. If the client stated a technical constraint, record it under `Constraints`.

If a statement is too vague to describe as behaviour, do not invent the specifics. Write the intent in one line and raise a blocking open question.

## 4. Assumptions and questions carry consequences

- Each assumption states what happens if it turns out to be wrong: rework, scope change, or a commercial conversation. An assumption with no consequence is not worth recording.
- Each open question is marked `blocking` (the module cannot be described accurately enough to build from without it) or `non-blocking` (it can be defaulted and confirmed later). Be strict: blocking questions are what stop a module from moving forward.
- Phrase every open question so a non-technical client could answer it, and where possible attach a proposed default.

## 5. Size band, not an estimate

Give each module a band: S (a few days), M (one to two weeks), L (too big — say how you would split it). This is a sequencing signal only. Never present it as an estimate and never convert it to hours.

## Output format

For each module, in the order it should be built. Do not add headings beyond these, do not nest deeper than `##`, and do not wrap the output in code fences.

```
# M-01 <Module title>

Size band: <S|M|L> | Readiness: <ready-to-hand-over | needs-answers | not-a-change-yet>

## Purpose
<business outcome in 2-3 sentences — what changes for the client's operation>

## Scope
In scope: <bullets>
Out of scope: <bullets — including anything the client raised and deferred>

## Users And Permissions
- <role — what they may do, what they may not>

## Workflows
- <numbered user-visible steps of the main path, then the exception paths>

## Expected Behaviour
- <concrete statement of what the system should do, in the client's terms>

## Data Requirements
- <information used, produced, or kept — including retention or lifecycle points the client actually mentioned>

## Business Rules And Edge Cases
- <rule, restriction, or exception, including what should happen when it is hit>

## Integrations And Side Effects
- <external system, notification, export, report, or audit obligation>

## Constraints
- <client-stated technical, regulatory, contractual, or deadline constraint>

## Confirmed Decisions
- <decision> — <speaker, timestamp or short quote>

## Assumptions
- <assumption> — if wrong: <consequence>

## Open Questions
- OQ-01 [blocking] <question> — proposed default: <default>
- OQ-02 [non-blocking] <question>

## Dependencies
- <M-xx must land first, or "none">
```

After the last module, add:

```
# Summary

## Build Order
- <M-xx → M-xx → M-xx, with the reason for the ordering>

## Blocking Questions Across All Modules
- OQ-xx (M-xx): <question>

## Parking Lot
- <mentioned, not scoped — with the reason>

## Explicit Non-Goals
- <the client ruled this out — with evidence anchor>

## Scope Risks
- <where this conversation is likely to expand later, and which module absorbs it>
```

Write to `docs/discovery/<feature-slug>/modules.md`, or wherever this repo keeps discovery notes. Do not write into `openspec/` — that directory holds OpenSpec's own artifacts. If there is no obvious place, return the Markdown inline.

## Before returning, check

- No requirement wording, scenario formatting, or spec structure crept in — this is a brief, not a specification.
- No implementation detail appears anywhere outside `Constraints`.
- Every confirmed decision has an evidence anchor; every assumption has a consequence.
- Every module's readiness is consistent with its open questions: a module with a blocking question is never `ready-to-hand-over`.
- Nothing appears in a module that is not traceable to the transcript, an explicit assumption, or the prior document.
- Modules are not padded to look thorough. A meeting that produced two real changes yields two modules.
