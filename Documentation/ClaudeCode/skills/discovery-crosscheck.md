---
name: discovery-crosscheck
description: Cross-check a meeting transcript against the prepared discovery questions, classify coverage, flag conflicts and blockers, and draft a short follow-up message asking only for what is genuinely missing.
argument-hint: "<@questions.md and @transcript.md, or both pasted> [| lang: pl|en] [| channel: email|chat]"
disable-model-invocation: true
allowed-tools: Read Glob Grep Write
context: fork
---

# Discovery Cross-Check

Input:

$ARGUMENTS

Determine what the meeting actually answered, what it left open, and what has to come back from the client before work can start.

## 0. Identify the two inputs

The input contains a discovery question list and a meeting transcript, as paths or pasted text.

- If paths are given, read them. If a discovery folder is given, use `questions.md` and the transcript inside it.
- If only one of the two is present, say which is missing and stop. Do not reconstruct a question list from the transcript — that defeats the purpose of the check.
- If the structure is ambiguous, state the interpretation you used in one line at the top of the output and continue.
- Reuse the `Q-xx` and `A-xx` IDs from the question list exactly. If the list has no IDs, assign them in document order and say so.
- Also cross-check the `Assumptions To Confirm` block: an assumption the client never addressed is an open item, not a confirmed default.

## 1. Status taxonomy

Assign exactly one status per question:

| Status | Meaning |
|---|---|
| `answered` | The client gave a usable answer. You could write the requirement from it today. |
| `partial` | Direction is clear, a specific needed detail is not. Name the missing detail precisely. |
| `conflicting` | Two people, or the same person twice, said incompatible things. Both sides cited. |
| `deferred` | The client explicitly postponed the decision. Record who owns it and by when, if stated. |
| `not_asked` | Never raised in the meeting. |
| `dodged` | Raised but not answered — the client changed subject or said they would check. |

`not_asked` and `dodged` are different problems: the first is a meeting-execution gap, the second usually means the client does not know yet. Do not collapse them into "unanswered".

## 2. Evidence and honesty rules

- Cite speaker and timestamp where the transcript has them. Quotes stay under 15 words; paraphrase anything longer and label it as a paraphrase.
- Never mark something `answered` on the strength of an analyst statement the client merely did not contradict. Silence is not agreement.
- A recommendation is never evidence. Keep the three apart at all times: what the client said, what we are assuming, what we recommend.
- Where a transcript passage is garbled, treat the question as `partial` and say the transcript is unclear.

## 3. Blockers

Classify every non-`answered` item by what it actually blocks:

- `blocks-scope` — the change cannot be described accurately enough to build from without it
- `blocks-estimate` — the change can be described, but the effort range stays wide
- `blocks-nothing` — a sensible default carries it; confirm in passing

Only `blocks-scope` items belong in the summary's blocker list. Resist inflating: if a defensible default exists and the cost of being wrong is small, it is not a blocker.

If a modules document from the same discovery exists, name the affected module (`M-xx`) next to each blocker.

## 4. Recommend, don't guess

For every `partial`, `not_asked`, `dodged`, or `deferred` item where a reasonable default exists, propose one — phrased so the client can reply "yes" rather than compose an answer. Mark every one as a recommendation. Do not propose defaults for genuine business decisions: pricing, legal responsibility, who approves what, data retention obligations, or anything with a regulatory dimension.

## Output format

Produce exactly these sections. Do not wrap in code fences.

```
# Cross-Check: <feature> — <meeting date>

## Summary
- Answered: <n> | Partial: <n> | Conflicting: <n> | Deferred: <n> | Not asked: <n> | Dodged: <n>
- Coverage of Must-ask questions: <n>/<n>
- Ready to scope the change: <yes | no — n blockers>
- Blockers: <one line each, max 5>

## Coverage
| ID | Question | Status | Blocks | Evidence |
|---|---|---|---|---|
| Q-01 | <shortened question> | answered | — | <speaker @ time> |

## Needs Attention
### Q-xx — <status>
Asked: <question>
What we heard: <1-2 sentences, product language>
Missing: <the precise detail that is absent>
Recommendation: <proposed default, marked as ours>
Impact if unresolved: <what goes wrong>

(one block per non-answered item; nothing for answered ones)

## Conflicts
- Q-xx: <person A said X (anchor)> vs <person B said Y (anchor)> — <what needs deciding, and by whom>

## Confirmed Since The Question List
- A-xx: confirmed | corrected to <new default> | still open

## Message To Client

Subject: <specific — name the feature and the decision needed>

<message body>

## Internal Notes
- <what we can proceed with without waiting, and what we must not start>
```

## Rules for the client message

- Write it in `lang` (default: the language the client spoke in the transcript). All other sections stay in English.
- Under 250 words. At most 8 asks, merged by topic — several overlapping questions become one.
- Every ask carries our proposed default, so the client can reply with a single confirmation. Open-ended questions only where a default would be presumptuous.
- One sentence on why it matters and by when, tied to a real consequence (sprint start, dependency, deadline the client themselves named). No manufactured urgency.
- Thank them once, briefly. No recap of what they already told us, no apologies, no filler.
- Never expose internal labels: no `Q-xx` IDs, no status names, no "blocker", no module IDs.
- For `channel: chat`, drop the subject line and salutation and use short bullets.

Write to `docs/discovery/<feature-slug>/crosscheck-<date>.md`, alongside the question list. Do not write into `openspec/`. If there is no obvious place, return inline.

## Before returning, check

- Every question from the list appears exactly once in the coverage table.
- No status is `answered` without evidence.
- Every blocker in the summary has a matching `Needs Attention` block.
- The client message asks nothing the transcript already answered.
- The message reads like a person wrote it, and could be sent with no editing beyond the greeting.
