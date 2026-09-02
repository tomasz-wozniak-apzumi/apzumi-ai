# Apzumi OpenSpec Starter Template

Starter repository for Apzumi spec-driven projects, built on
[OpenSpec](https://github.com/Fission-AI/OpenSpec) with our own `apzumi-sdd`
workflow schema.

The workflow every change follows:

```
proposal → specs → design → tests → review → tasks → apply
```

## What this template bakes in

The `apzumi-sdd` schema is a fork of OpenSpec's built-in `spec-driven` schema
(OpenSpec has no schema inheritance — forking is the supported customization
path) with five deliberate hardenings:

1. **design.md has teeth** — the template and instruction force the agent to
   inspect the real codebase and produce API surface, existing-API impact,
   data model/migrations, an explicit CREATE-vs-MODIFY file list, flow, and a
   testing strategy — while keeping the ADR-style decisions section. Anything
   that can't be grounded in a real file becomes an Open Question, never an
   invented path.
2. **tasks.md is grounded and atomic** — one task = one logical commit, every
   task names a real file path and the requirement it satisfies, ordered by
   dependency, automated tests as separate scenario-linked tasks. When the
   change has a `tests.md`, the first task under each platform generates that
   platform's test code from the rows a tester assigned to its framework —
   delegated to `@apzumi-generate-test-code`, and done when those tests *fail*
   for the right reason, or when it reports honestly that it could not run
   them (no device, no build) having passed every static check available. A
   suite that passes before the feature exists is a defect in the tests, and
   saying so is the most valuable thing that step catches.
3. **Two test layers that cannot be confused** — `tests.md` is **layer 1,
   acceptance**: one consolidated black-box plan per change (T1/T2/… table,
   tester-observable behaviour only), designed by
   `@apzumi-design-test-scenarios`. **Layer 2, unit & integration**, is
   hand-written in tasks.md from the specs and design. Task labels
   (`[E2E automation]`, `[Unit]`, `[Integration]`) keep them visibly distinct,
   and the validator rejects a layer-1 task in the layer-2 group. Manual QA
   never leaks into tasks.md.
   Each row carries the platforms it covers, the agent's automation
   *recommendation*, and — a person's field, never the agent's — the tester's
   *decision* on whether and how to automate it. Only the rows a tester
   assigned to a framework become E2E tests, so the generator can never
   automate something a human marked `manual`. Approval is file-level and
   gates `review`, which means implementation cannot start on scenarios nobody
   signed.
4. **A reflection gate** — `review` is a real artifact that `tasks` depends on.
   It invokes the read-only `apzumi-openspec-reviewer` subagent
   (`.claude/agents/apzumi-openspec-reviewer.md`, running on a different model tier)
   to critique all planning artifacts against the existing specs and codebase
   before any code is written, with a bounded fix loop (max 5 rounds).
5. **No capability sprawl** — the specs instruction makes the agent enumerate
   existing capabilities and extend them before minting new ones, preferring
   coarse domain-level names. On a greenfield project there is nothing to
   enumerate, so `openspec/CONVENTIONS.md` carries a **Capability Map**: the
   agreed 4-8 domain taxonomy, written before the first change. It holds
   names and scopes only — requirements reach `openspec/specs/` solely
   through a change and its review gate, never by hand.

Org-wide conventions (platform-split sections, the Figma never-invent-a-URL
policy, conciseness standards) live in the schema, so every project using this
template inherits them automatically.

## What survives archival

OpenSpec's built-in archive only merges delta specs into `openspec/specs/` and
moves everything else — the test plan, the design rationale — into
`openspec/changes/archive/<date>-<name>/`, never to be read again. This
template adds two more living documents:

- **Regression suite** — `openspec/specs/<capability-path>/tests.md`,
  mirroring the capability's own folder. Each row records the change it came
  from (`Source`) and that change's own scenario number (`Origin`), so a failed
  `BILLING-T7` traces back to one row in one archived change. Only rows tagged `Regression` in the
  change's `tests.md` are merged in; `One-off` rows (migration checks,
  one-time verifications) stay in the archived change only. A change that
  REMOVES or MODIFIES a requirement also lists the suite IDs it invalidates,
  which get **moved into a `## Retired` section** rather than deleted — so the
  suite stops testing behaviour that no longer exists without losing the record
  that it once did.
- **Decision log** — `openspec/decisions/NNNN-<slug>.md`, plus a maintained
  index in [openspec/decisions/README.md](openspec/decisions/README.md). Each
  block under design.md's `## Decisions & Trade-offs` becomes its own
  append-only ADR. That README also sets the bar for what earns one — the
  answer is deliberately "not much", so the log stays readable.

Both are written by `/apzumi-sync-knowledge`, which runs as a **separate step
before archiving**:

```
1. /apzumi-sync-knowledge <change>     ← merges the suite + extracts ADRs
2. /openspec-archive-change <change>   ← stock OpenSpec, unmodified
```

Archiving itself is untouched — the skill never wraps or replaces it, so
`openspec update` can change the archive workflow freely. Nothing structurally
forces step 1, so two things catch a miss: the
`operations.archive.guidance` entry in `openspec/config.yaml` warns at archive
time, and **the conventions checker fails CI** if an archived change's
Regression rows never reached a living suite or its decisions never became
ADRs. A forgotten sync is therefore loud rather than silent.

Archiving a batch with `/openspec-bulk-archive-change` would take every
change's knowledge with it, so `/apzumi-sync-knowledge` accepts several change
names and processes them one at a time — run it across the batch first.

Everything else (proposal.md, the full design.md, tasks.md) is intentionally
left archived-only: its durable content already lands in the capability's
`## Purpose` (main spec) and the ADR.

## Repository structure

```
.
├── README.md                  ← this file
├── SETUP.md                   ← per-project setup checklist
├── CLAUDE.md                  ← Claude Code collaboration rules
├── .claude/
│   ├── agents/                ← ours: independent jobs that report back
│   │   ├── apzumi-openspec-reviewer.md        (read-only review gate)
│   │   ├── apzumi-design-test-scenarios.md    (acceptance scenarios + QA
│   │   │                                       automation recommendation)
│   │   ├── apzumi-generate-test-code.md       (E2E generation, per platform)
│   │   ├── apzumi-failure-triage.md           (read-only: what is a failure
│   │   │                                       evidence of?)
│   │   └── apzumi-test-maintainer.md          (minimal repair, hard budget)
│   ├── skills/apzumi-sync-knowledge/        ← ours: merges suites + ADRs
│   ├── skills/apzumi-verify-automation/     ← ours: runs the tests against a
│   │                                          real build, after implementation
│   └── skills/openspec-*      ← generated by the OpenSpec CLI —
│                                never edit; `openspec update` rewrites
├── .github/workflows/
│   └── openspec-validate.yml  ← runs both validators on every PR
├── scripts/
│   └── apzumi-validate.mjs    ← checks the conventions OpenSpec can't
└── openspec/
    ├── config.yaml            ← per-project context + rules (fill in!)
    ├── CONVENTIONS.md         ← platforms, Capability Map, terminology,
    │                             repo wiring (fill in!)
    ├── decisions/             ← append-only ADR log + index
    ├── specs/<capability>/    ← main specs + living regression suites
    └── schemas/apzumi-sdd/    ← the shared workflow schema
        ├── schema.yaml
        └── templates/         ← proposal, spec, design, tests,
                                 review, tasks
```

**What goes where:** the schema owns org-wide *structure and format*;
`config.yaml` owns the per-project *facts* injected into every artifact prompt
(stack, testing, the API source of truth) and points at CONVENTIONS.md for the
rest; `CONVENTIONS.md` owns
per-project *taxonomy and long-form* material (platform names, the Capability
Map, terminology, repo wiring, API reference procedure);
`CLAUDE.md` owns *collaboration behaviour*.

Nothing under `.claude/skills/openspec-*` is edited by this template — it is
regenerated verbatim by `openspec update`. Everything the template adds lives
beside it, which is why upgrading OpenSpec cannot clobber our work.

**Agent or skill?** A skill's instructions load into the current conversation:
the main agent performs them, with the conversation's context and its own
tools. A subagent runs in its own context window with its own tool allowlist
and returns only a report. So the rule here is — *skills are procedures the
main agent performs; agents are self-contained jobs whose working tokens
should not leak back*. `apzumi-sync-knowledge` is a skill because it needs to
know which change you are discussing and its edits are small and targeted. The
reviewer is an agent because it must not be able to write, and must read the
artifacts cold rather than re-reading its own reasoning. The test-code
generator is an agent because it reads a great deal to write a bounded
deliverable, and because an agent that never sees the implementation checklist
cannot drift into implementing the feature to make its own tests pass.

## Starting a new project

1. Copy this repository.
2. Work through [SETUP.md](SETUP.md). Do **step 1a first** — OpenSpec's
   per-machine global settings decide which workflows exist, and a default
   install is missing `openspec-new-change` and `openspec-continue-change`,
   the two this template's flow is built on. Then fill in
   `openspec/config.yaml` and `openspec/CONVENTIONS.md`, and validate.
3. Start the first change in Claude Code: `/openspec-new-change` (step by
   step) or `/openspec-propose` (all planning artifacts at once).

## Enforcement — read this

OpenSpec does not hard-block on a review verdict. The gate is enforced by
**convention + dependency**: `tasks` (and therefore `apply`) requires the
`review` artifact to exist, and its instruction won't record PASS until 🔴
issues are cleared. Two practices keep it honest:

- Prefer the step-by-step flow (`/openspec-continue-change`) over
  fast-forwarding all artifacts at once, so the review gate actually pauses.
- Do not start `apply` until `review.md` ends with `Verdict: PASS`
  (this rule is also in [CLAUDE.md](CLAUDE.md)).
- Run the conventions checker, in CI or before archiving:

```bash
node scripts/apzumi-validate.mjs
```

  It fails when a change has `tasks.md` without a passing review, or a passing
  review over a `tests.md` nobody signed; when an archived change's Regression
  rows never reached a living suite or its decisions never became ADRs; when a
  platform group is missing its `[E2E automation]` task or has it out of order;
  when a scenario is missing its `Regression`/`One-off` type; when a UI-facing
  spec has no confirmed Figma link; when suite IDs collide, use the wrong
  capability prefix, or outlive the capability's `spec.md`; and when the ADR log
  has a numbering gap or an index row that disagrees with the ADR's own status.

  It also fails on the QA half of `tests.md`, the part a human owns: a
  half-filled approval, an approval naming a tool rather than a person, an
  `Automation` or `Decision` value that is not one of the allowed ones, a
  per-platform `Decision` that does not cover the platforms its row claims, a
  platform name absent from CONVENTIONS.md, and a signed file still carrying an
  undecided Regression row. Then the one that closes the loop: an
  `[E2E automation]` task must cover exactly the rows a tester assigned to that
  platform's framework. Generating a test for a row marked `manual` overrides a
  human decision; not generating one a tester asked for loses coverage
  silently. Nothing linked those two before. `openspec validate
  --all` covers specs and changes; this covers everything OpenSpec has no
  concept of.

### When to run it

| Moment | Why |
|---|---|
| After `review` is written, before `apply` | Catches a gate that never reached PASS, and mistyped scenarios, while fixing them is still free |
| After `/apzumi-sync-knowledge`, before archiving | Confirms the suite merge and ADR extraction left the living docs well-formed |
| On every PR, in CI | The only moment that is not optional — [.github/workflows/openspec-validate.yml](.github/workflows/openspec-validate.yml) ships ready to use |

Nothing needs installing: it uses Node built-ins only, so `node
scripts/apzumi-validate.mjs` works in any repo that already has Node for the
OpenSpec CLI. Flags: `--root <path>` validates a different checkout;
`--quiet` suppresses warnings and the OK line, for hooks;
`--no-archive-check` skips the "was this archived change ever synced?" pass
while adopting the workflow in a repo with existing archives;
`--ui-platforms` / `--no-e2e-platforms` override the defaults for which
platforms need a Figma link and which have nothing to automate; and
`--results-dir <path>` turns on the "was it ever run?" pass, which fails an
archived change whose scenarios a tester assigned to a framework when no
committed run under that path mentions their suite ids. That one is opt-in
because the link is by test name, so it only means anything once a project
commits its results.

## Benefiting from OpenSpec upgrades

The fork is deliberately small (one `schema.yaml` + six templates). Most of
what improves between OpenSpec versions — the CLI, the generated skills, the
apply/archive machinery — is **not** forked and arrives normally:

```bash
npm install -g @fission-ai/openspec@latest   # or your install method
openspec update                              # regenerates .claude/skills/openspec-*
```

`apzumi-sdd` v3 is aligned with upstream `spec-driven` as of **OpenSpec
1.9.0** — it carries upstream's capability contract, `## Purpose` rules,
`RENAMED` delta operation, `skip_specs` guidance, and Open Questions
discipline. To port future upstream improvements, see the upstream-sync
procedure in [SETUP.md](SETUP.md#upstream-sync-when-openspec-releases-a-new-version).

## Who may write what

The flow only means something if the boundaries hold, so here they are in one
place. Every row is enforced by `scripts/apzumi-validate.mjs`, an agent's tool
list, or both — none of it rests on an agent choosing to behave.

| Field | Written by | Never written by |
|---|---|---|
| the delta specs, `design.md` | the authoring session, with a human reviewing | — |
| `tests.md` rows: scenario, steps, expected result, `Type`, `Platforms` | `@apzumi-design-test-scenarios` | — |
| `tests.md` → `Automation` | `@apzumi-design-test-scenarios` — a recommendation | — |
| `tests.md` → `Decision` | **a person** | any agent, under any instruction |
| `tests.md` → `Approved by` / `on` | **a person** | any agent, under any instruction |
| `review.md` findings and verdict | `@apzumi-openspec-reviewer` reports, the session records | an agent recording PASS over an unsigned `tests.md` |
| test code under a platform's test root | `@apzumi-generate-test-code`, then `@apzumi-test-maintainer` | anything that would change what a test proves |
| a failure's classification | `@apzumi-failure-triage`, read-only | the step that would benefit from a different answer |
| product code | the implementer, from `tasks.md` | any of the QA agents |

The two rows in bold type are the whole point. An agent that can write a
tester's decision or signature has removed the human from a loop that exists
to keep them in it, and every gate downstream becomes decoration. That is why
the ban is stated in the schema, in the agent files, in `CLAUDE.md`, and
checked in CI — four places, because one is a place to forget.

## Governance

Treat `openspec/schemas/apzumi-sdd/` as a governed internal standard: version
it (`version:` in `schema.yaml`), review changes to it like code, and roll
improvements back into this template so every team inherits the same gate.
