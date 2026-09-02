---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
disable-model-invocation: true
---

Run a `/grilling` session, using the `/domain-modeling` skill.

Prioritize questions by impact × uncertainty — ask about what would change the design AND isn't settled. For details with an industry-standard default, assume the default and record it as an assumption instead of asking.

The only files this skill writes are `docs/glossary.md` and `docs/adr/` entries, captured inline as terms and decisions crystallise. When the interview ends, stop and hand off: suggest `/to-spec` then `/to-tickets` when the work spans multiple sessions, or `/implement` directly when it fits in one — and let the user invoke the next step themselves.
