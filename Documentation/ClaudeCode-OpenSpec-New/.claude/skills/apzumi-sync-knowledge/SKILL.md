---
name: apzumi-sync-knowledge
description: Merge a completed apzumi-sdd change's durable knowledge into the living docs — Regression-tagged test scenarios into each capability's regression suite, and design.md's Decisions & Trade-offs into the ADR log. Run this before archiving. It does not archive anything; archiving stays a separate, normal OpenSpec step.
allowed-tools: Bash(openspec:*), Read, Write, Edit, Glob, Grep
license: MIT
---

Merge the durable knowledge out of a completed `apzumi-sdd` change and into the
living documents, so it survives after the change is archived:

- **Regression suite** — `Regression`-tagged rows from `tests.md` into
  `openspec/specs/<capability-path>/tests.md`, and retirement of rows
  the change made obsolete.
- **Decision log** — each block under design.md's `## Decisions & Trade-offs`
  into `openspec/decisions/NNNN-<slug>.md`, plus the index in
  `openspec/decisions/README.md`.

This is the analogue of the built-in `openspec-sync-specs`, which merges delta
specs into main specs without archiving. Same idea, different content.

**This skill does not archive.** Archiving is a separate, unmodified OpenSpec
step the user runs afterwards (`/openspec-archive-change <name>`, or
`openspec archive <name>`). Never invoke, wrap, or substitute for it here.

**Run this BEFORE archiving.** Archive moves the change out of
`openspec/changes/<name>/`, and this skill only operates on active changes.

**Multiple changes at once:** accept a list of change names and process them
one at a time, in the order given, repeating steps 1-6 for each. Do this before
`/openspec-bulk-archive-change`, which would otherwise archive a batch and take
every change's knowledge with it. Report per change, and if one fails, stop
and say which ones were already synced — the rest can be re-run safely.

Only for changes on the `apzumi-sdd` schema — others have no
`tests.md` or `## Decisions & Trade-offs` section to merge.

**Capability paths:** a capability is identified by its path relative to
`specs/` — `billing` in a flat layout, `identity/user-auth` where the project
nests. Mirror the full path when resolving its living suite. Derive the
scenario-ID prefix from the LAST segment only, uppercased with non-alphanumerics
as hyphens: `billing` → `BILLING-`, `identity/user-auth` → `USER-AUTH-`.

**Store selection:** if the user names a store or the work lives in one, run
`openspec store list --json` and pass `--store <id>` on every `openspec`
command below.

**Steps**

1. **Select the change and load status**

   Resolve the change name (from the user, conversation context, or by listing
   active changes with `openspec list --json` if ambiguous — show only changes
   on `apzumi-sdd`). Announce "Using change: <name>".

   ```bash
   openspec status --change "<name>" --json
   ```

   Note `planningHome.root` (main specs live at
   `<planningHome.root>/openspec/specs/`) and `changeRoot`.

   **If the change cannot be resolved**, check
   `<planningHome.changesDir>/archive/` for a directory ending in `-<name>`:
   - Found → stop. Report that the change is already archived, that this skill
     must run before archiving, and give the archived path so the user can
     merge by hand if they still want the content in the living docs. Do not
     attempt a partial merge.
   - Not found → stop and report that no such change exists.

2. **Check the review gate**

   Read `<changeRoot>/review.md`. If it does not exist or its final line is not
   `PASS`, warn the user ("review has not passed — the decisions and test
   scenarios about to be promoted into permanent docs may be unvetted") and ask
   for confirmation before continuing.

3. **Merge Regression test scenarios into the living suite**

   Read `<changeRoot>/tests.md`. If it doesn't exist, skip to step 4. If it
   is the one-line `Not applicable — this change declares skip_specs` marker,
   there is nothing to merge — skip to step 4 as well.

   For each capability heading (`## <capability-path>`) in the file:
   - Collect only the rows tagged `Regression` in the Type column. Skip
     `One-off` rows — they stay in the change only.
   - Read (or create) `<planningHome.root>/openspec/specs/<capability-path>/tests.md`,
     mirroring the full capability path. If creating, seed it with a title and
     the intro line `Living manual regression suite. Merged from change test
     plans by apzumi-sync-knowledge; only Regression-tagged scenarios land
     here.` and a table header
     `| # | Scenario | Steps | Expected Result | Source | Origin |`.
   - **Idempotency check**: a row's identity is `Source` + `Origin` — the
     change name plus the T-number that row came from. Before appending, look
     for an existing row with the same pair:
     - Found and identical → skip; this is a re-run.
     - Found but the scenario text differs → the change's tests.md was edited
       after the last sync. UPDATE that row in place rather than appending, so
       a corrected scenario replaces its earlier version instead of the suite
       carrying both. Keep its existing suite ID.
     - Not found → append as a new row.
     Never key idempotency on scenario text alone: an edited typo would read as
     a new scenario and silently duplicate it.
   - Assign new IDs by continuing that file's existing numbering, using the
     prefix rule above (e.g. if `BILLING-T3` is the highest existing ID, the
     next is `BILLING-T4`). Start at `<PREFIX>T1` for a brand-new file.
     Number past retired IDs — never reuse a retired number.
   - Set `Source` to the change name and `Origin` to that scenario's T-number
     in the change (e.g. `T4`), so a QA report of `BILLING-T7` traces straight
     back to `changes/archive/*-<name>/tests.md` → `T4` without guesswork. Do
     not write an archive path — this runs before archiving, so the archive
     date isn't known yet.
   - Do not touch rows already in the file from earlier changes.
   - If the capability folder has a `tests.md` but no `spec.md`, the capability
     was retired by an earlier archive (`retire_capabilities: true` deletes the
     main spec but leaves our suite behind). Do not add rows to it — report it
     so the orphaned suite can be retired or deleted.

4. **Retire scenarios the change made obsolete**

   Read the `## Retired scenarios` section of `<changeRoot>/tests.md`
   (absent when the change only adds behaviour — then skip this step).

   For each listed suite ID:
   - Find the row in the relevant capability's living suite. If the ID is not
     there, report it and continue — do not guess at a match.
   - **Move** the row out of the active table and into a `## Retired` section
     at the end of that suite file, appending two columns: the reason given,
     and the change that retired it. Create the section if absent with the
     header `| # | Scenario | Reason | Retired by |`.
   - Never delete the row outright: QA must stop executing it, but the history
     of what was once guaranteed is worth keeping and costs nothing.
   - Idempotent: a row already in `## Retired` is left alone.

   This is what stops the suite accumulating tests for behaviour that no longer
   exists. A change with REMOVED or MODIFIED requirements that lists nothing
   here is suspicious — say so in the summary rather than silently proceeding.

5. **Extract ADRs from design.md**

   Read `<changeRoot>/design.md`. If it has no `## Decisions & Trade-offs`
   section or it is empty, skip to step 6.

   For each decision block in that section (each has its own title):
   - **Idempotency check**: scan `openspec/decisions/*.md` for an existing ADR
     with the same `Change:` value and the same title. If found, skip it.
   - Determine the next ADR number: read `openspec/decisions/`, find the highest
     `NNNN` prefix among existing files, increment (zero-padded to 4 digits;
     start at `0001` if the directory holds only its `README.md`).
   - Write `openspec/decisions/NNNN-<slug-of-title>.md` following the format in
     `openspec/decisions/README.md`: Status `Accepted`, today's date, the change
     name, the capabilities this change touched (from its delta specs), and the
     Context/Decision/Alternatives/Consequences content from the block.
   - If the decision block explicitly says it supersedes an earlier one, set
     `Supersedes: NNNN` on the new ADR and update the old ADR's `Status` line to
     `Superseded by [NNNN](NNNN-slug.md)` — this is the ONLY edit ever made to
     an existing ADR file.

6. **Update the ADR index**

   Append one row per new ADR to the index table in
   `openspec/decisions/README.md`: number (linked to the file), title, status,
   capabilities, and source change. Keep it ordered by number. When step 5
   superseded an earlier ADR, update that ADR's row's Status cell to match.
   The index is the only part of `openspec/decisions/` that is ever rewritten.

7. **Summarize and hand back**

   Report:
   - Regression suite: capabilities updated and how many scenarios each gained
     (e.g. "billing: +2 (BILLING-T4, BILLING-T5)"), or "No tests.md —
     nothing merged."
   - Retired: suite IDs moved to `## Retired`, or any listed ID that could not
     be found. Flag a change with REMOVED/MODIFIED requirements that retired
     nothing.
   - ADRs created: file names and titles, and index rows added.
   - Anything skipped because it already existed (re-run case).

   Then tell the user the knowledge sync is complete and archiving is the next,
   separate step — `/openspec-archive-change <name>` — without running it.

   Suggest running `node scripts/apzumi-validate.mjs` to confirm the living
   docs are still well-formed.

**Guardrails**

- Never archive, and never invoke or wrap `openspec-archive-change`. The user
  runs archiving themselves as a normal OpenSpec operation.
- Never edit an existing regression-suite row's content or an existing ADR's
  body — only append rows/files, move a row into `## Retired`, flip a
  superseded ADR's Status line, and maintain the index.
- Never merge a `One-off` row into the living suite.
- Never reuse a retired scenario ID.
- Operate on active changes only; stop cleanly if the change is already
  archived rather than half-merging from the archive.
- Every step is idempotent — a re-run must not duplicate rows, ADRs, or index
  entries.
- If a step fails partway, report what succeeded and stop, so the user can fix
  and re-run before archiving.
