# Setup Checklist

Use this checklist when starting a new project from this template.

## 1. Prerequisites

- [ ] OpenSpec CLI installed and available as `openspec` (`openspec --help`).
- [ ] Claude Code installed and configured.
- [ ] **OpenSpec global settings configured (see below).** These are per-machine,
      not per-repo — every developer on the project has to do this once, and a
      default install does NOT match what this template documents.
- [ ] A Git repository initialised for the project (documentation decisions
      get reviewed and versioned like code).

### 1a. Required global OpenSpec settings

OpenSpec stores two settings in `~/.config/openspec/config.json` that decide
which workflows exist and how they are invoked. Both default to values this
template does not work with. Check what you have:

```bash
openspec config list
```

**`profile` must be `custom` with all 12 workflows.** The default profile is
`core`, which ships only six: `propose, explore, apply, update, sync, archive`.
That omits `new` and `continue` — the step-by-step entry points this template
treats as the primary flow, and the reason the review gate pauses at all — plus
`verify`, `ff`, `bulk-archive`, and `onboard`. Run the picker and select every
workflow:

```bash
openspec config profile
```

**`delivery` decides skills vs commands.** With `skills` (or the default
`both`) you get `.claude/skills/openspec-*`, invoked as `/openspec-new-change`.
With `commands` you instead get `.claude/commands/opsx/*.md`, invoked as
`/opsx:new` — and switching to `commands` **deletes** the generated skills.
This template's docs name the skill form throughout, so use `skills` or `both`:

```bash
openspec config set delivery skills
```

Verify before starting work. `openspec config list` must show
`profile: custom`, `delivery: skills` (or `both`), and all 12 workflows —
`config get` reads one key at a time, so use the full listing to check all
three at once:

```bash
openspec config list
```

If a teammate reports that `/openspec-new-change` or `/openspec-continue-change`
does not exist, this is why: they are on the `core` profile.

## 2. Project Context

- [ ] Fill the `context` block in `openspec/config.yaml`: project name, stack,
      testing, and conventions. Platforms, terminology, and the capability
      taxonomy deliberately do NOT live here — `context` points at
      CONVENTIONS.md so the two cannot drift. Delete the commented blocks in
      that file that do not apply.
- [ ] If the project has a live API contract (Swagger/OpenAPI), keep and fill
      the "API source of truth" block in `openspec/config.yaml`; otherwise
      delete it.
- [ ] Fill `openspec/CONVENTIONS.md`, section by section: the Platform
      Architecture table, the Capability Map, Terminology, Connected
      Implementation Repositories (submodules/paths, non-default working
      branches), Backend API Reference, and Figma. Delete sections that do not
      apply.
- [ ] In `openspec/CONVENTIONS.md` → `## Capability Map`, name 4-8 coarse
      domains with a one-line scope each. This matters most on a greenfield
      project: with `openspec/specs/` empty it is the only capability taxonomy
      the first changes have to target, and without it each one invents its
      own naming. Write only domain names and scopes in that table —
      requirements reach `openspec/specs/` solely through a change and its
      review gate.
- [ ] Add project-specific `rules:` in `config.yaml` only where the schema's
      defaults are not enough (the commented block in that file shows the
      backend-API-grounding pattern). Quote any rule containing `#`.

## 3. AI Collaboration Rules

- [ ] Review `CLAUDE.md`; add client-specific compliance, security, privacy,
      or delivery constraints.
- [ ] Confirm all three agents are present under `.claude/agents/`:
      - `apzumi-openspec-reviewer.md` — the review gate. Its `model: opus`
        pins it to a different tier than the authoring session (that
        independence is the point); set `model: inherit` to disable the
        pinning. Read-only by design: `tools: Read, Grep, Glob`.
      - `apzumi-design-test-scenarios.md` — designs the change's acceptance
        scenarios into `tests.md` and recommends what is worth automating.
        Read-only on everything but that one file, and deliberately barred
        from reading product code: an agent that reads the implementation
        writes scenarios the implementation already satisfies. It never fills
        in `Approved by`, `on`, or a `Decision` — those are a person's.
      - `apzumi-generate-test-code.md` — E2E generation, currently a
        **placeholder** that refuses and reports. It carries `Bash` because
        its contract is to run the suite and prove the tests fail for the
        right reason, so review its tool list before implementing it.
- [ ] Restart Claude Code — subagents and skills are loaded at session start.
- [ ] Confirm `.claude/skills/apzumi-sync-knowledge/SKILL.md` is present. It
      updates the living regression suite and ADR log, and deliberately does
      not touch OpenSpec's own archive workflow (step 5 covers when to run it).

## 4. Validation

- [ ] The schema is structurally valid (syntax, templates exist, no cycles):

```bash
openspec schema validate apzumi-sdd
```

- [ ] It resolves to this project's copy, not a global or built-in one — the
      output must show `Source: project`:

```bash
openspec schema which apzumi-sdd
```

- [ ] No unexpected active changes. An empty starter reporting nothing is the
      expected result here:

```bash
openspec list --json
```

- [ ] No template placeholders left behind. Every `<...>` in
      `openspec/CONVENTIONS.md` and the `context` block of
      `openspec/config.yaml` must be replaced or deleted — an unfilled platform
      table silently weakens the conventions checker, which skips platform rows
      it cannot read:

```bash
grep -n '<[a-z]' openspec/CONVENTIONS.md openspec/config.yaml
```

- [ ] If you added `rules:` to `config.yaml`, confirm none were silently
      truncated by an unquoted `#`:

```bash
python3 -c "import yaml,json;print(json.dumps(yaml.safe_load(open('openspec/config.yaml')).get('rules'),indent=2))"
```

      (Needs PyYAML: `pip install pyyaml`. The conventions checker below is
      stdlib-only and has no such dependency.)

- [ ] The apzumi-sdd conventions checker passes — it covers the review gate,
      scenario typing, suite IDs, and the ADR log, none of which OpenSpec
      knows about:

```bash
node scripts/apzumi-validate.mjs
```

      Adopting apzumi-sdd in a repo that already has archived changes? Add
      `--no-archive-check` to skip the "was this archived change ever synced?"
      pass until the back-catalogue is dealt with.

- [ ] CI runs both validators. The workflow already ships at
      `.github/workflows/openspec-validate.yml` — you do not need to write it,
      but do check its `branches:` list matches this project's default branch,
      and that the pinned `@fission-ai/openspec@^1.9.0` still matches the major
      the team runs locally. To run the same pair by hand:

```bash
openspec validate --all && node scripts/apzumi-validate.mjs
```

## 5. First Change

- [ ] Gather initial business context, stakeholder notes, or a transcript.
- [ ] Start with `/openspec-new-change` (step by step, recommended — the
      review gate actually pauses) or `/openspec-propose` (all planning
      artifacts at once; you must still run the review before apply).
- [ ] Keep assumptions and open questions explicit in the artifacts instead of
      blocking on every missing detail.
- [ ] Do not start apply until `review.md` ends with `Verdict: PASS`.
- [ ] Before archiving, run `/apzumi-sync-knowledge` so Regression-tagged test
      scenarios merge into `openspec/specs/<capability-path>/tests.md` and
      design decisions extract into `openspec/decisions/`. Then archive with
      `/openspec-archive-change` (or `openspec archive`) as usual.

## Updating apzumi-sdd in an existing project

The schema is a folder each project owns a copy of — `openspec schema fork`
copies only from built-in or registered schemas, not from a path or URL, so
there is no automatic pull. When the template ships a new version:

1. Copy all of these together — they are one versioned unit, and moving only
   some of them is how the pieces desynchronise (a change to the regression
   suite's columns, say, lives in the skill that writes it *and* the checker
   that reads it):
   - `openspec/schemas/apzumi-sdd/` — the workflow itself
   - `scripts/apzumi-validate.mjs` — the conventions checker
   - `.claude/skills/apzumi-sync-knowledge/` — writes the living suite and ADRs
   - `.claude/agents/apzumi-openspec-reviewer.md`,
     `.claude/agents/apzumi-design-test-scenarios.md` and
     `.claude/agents/apzumi-generate-test-code.md` — the review gate, the
     scenario designer and the E2E generator, all three delegated to by name
     from the schema
   - `.github/workflows/openspec-validate.yml` — if you have not customised it
2. Re-validate:

```bash
openspec schema validate apzumi-sdd && node scripts/apzumi-validate.mjs
```

3. Read the `description:` in `schema.yaml` — it records what each version
   changed — and reconcile anything project-specific you had added to
   `config.yaml` `rules:`.

The checker warns when `schema.yaml`'s `version:` is older than the version it
was built for, which is what catches a half-finished copy (new script, old
schema). Active changes already in flight keep the schema recorded in their
`.openspec.yaml`, so upgrading mid-change is safe.

## Re-running `openspec init` on an existing project

Safe, and verified against OpenSpec 1.9.0:

- `openspec/config.yaml` is detected as existing and left untouched.
- `openspec/schemas/apzumi-sdd/`, `openspec/decisions/`, and `openspec/specs/`
  are not touched at all — the CLI only writes the tool files it generates.
- `.claude/agents/` and the `apzumi-*` skills survive: skill removal only ever
  targets the known `openspec-*` workflow directories, and OpenSpec never
  writes to `.claude/agents/` at all.

The one thing that does change is the generated surface, and it follows the
machine's global settings rather than the repo's. Re-running `init` or `update`
on a machine set to `delivery: commands` removes `.claude/skills/openspec-*`
and writes `.claude/commands/opsx/*` instead; on the `core` profile it writes
only six workflows. Neither is a repo problem — fix the global settings (see
step 1a) and re-run.

Claude Code writes `.claude/settings.local.json` as you grant tool permissions.
That is per-developer state, which is why `.gitignore` excludes it — it is not
part of the template and should never be committed.

## Upstream sync (when OpenSpec releases a new version)

The CLI and generated skills update independently of our schema fork:

```bash
openspec update
```

That regenerates `.claude/skills/openspec-*` only:

- `.claude/skills/apzumi-sync-knowledge/` is ours, not CLI-generated, so it is
  left alone. It also never wraps the generated archive workflow, so upstream
  changes to that workflow cannot break it.
- `.claude/agents/` is never written to by OpenSpec at all, so all three of
  `apzumi-openspec-reviewer`, `apzumi-design-test-scenarios` and
  `apzumi-generate-test-code` are untouched.

Then check whether the built-in schema learned anything worth porting:

```bash
openspec schema fork spec-driven upstream-check
```

1. Diff `openspec/schemas/upstream-check/` against
   `openspec/schemas/apzumi-sdd/` (instructions and templates).
2. Port improvements you want into `apzumi-sdd`, preserving our additions:
   the tests artifact and its two-layer split, the review gate, the
   reuse-before-create and grounding rules, the Figma and platform policies,
   capability-grouped/Regression-tagged test scenarios, `## Test Identifiers`,
   the Capability Map lookup, ADR-ready design decisions, and apply's
   definition of done.
3. Delete `openspec/schemas/upstream-check/`.
4. Bump `version:` in `openspec/schemas/apzumi-sdd/schema.yaml` and re-run
   `openspec schema validate apzumi-sdd`.
5. Contribute the ported changes back to the shared template repository so
   other projects inherit them.
