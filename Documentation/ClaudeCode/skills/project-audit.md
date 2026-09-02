---
name: project-audit
description: >
  Use this skill whenever the user wants a formal, client-facing assessment of an existing
  codebase — an audit, code review, technical due-diligence, security or compliance
  assessment, production-readiness check, or codebase health report — that must inform a
  concrete decision. The decision may be a takeover, but equally a go/no-go on production, a
  quality-improvement programme, a compliance-remediation effort, an investment or acquisition
  call, or a rebuild-versus-continue choice. The skill does not guess which one the client
  faces: it assesses the codebase against all of these scenarios and recommends which road to
  take. The audit always assesses a fixed set
  of compliance frameworks (HIPAA, GDPR, PCI-DSS, SOC 2, OWASP Top 10, and mobile security
  where applicable) — reaching an evidenced "not applicable" conclusion where warranted — and
  produces a fixed, audience-structured report. Use it even when the user says only "review
  this codebase", "is this production-ready?", "audit our security", or "assess this project
  we might acquire", not just when they say "audit".
  Triggers: 'handover report', 'takeover report', 'codebase audit', 'code review report',
  'project audit', 'technical due diligence', 'technical assessment', 'codebase review',
  'code quality report', 'security audit', 'production readiness', 'compliance assessment',
  'acquisition due diligence', 'rebuild or continue'.
---

# Project Audit

This skill guides a systematic audit of an existing codebase and the production of a formal
**Client Report** — a deliverable given directly to a client as the input to a concrete
decision. The report characterises the codebase, identifies and scores its risks, assesses the
codebase against every strategic road open to the client — takeover, production go/no-go,
compliance remediation, quality improvement, acquisition, and rebuild-versus-continue — and
recommends which to take, backed by a prioritised, evidence-based remediation plan.

The report is read by four audiences with different needs: a **decision maker** (needs a
verdict and its basis), a **developer** (needs the technical state), an **operator/sysop**
(needs run, scale, and continuity facts), and a **compliance/security reviewer** (needs
framework assessments and data flows). The template in Phase 2 is structured around these
audiences.
It must be accurate to the point of being defensible, and never speculative where it
presents itself as factual.

---

## Core Principles (non-negotiable)

1. **This is a decision document.** Every part of the report exists to support a real decision.
   The skill does **not** infer which decision the client faces and does not narrow the analysis
   to a guessed objective: it assesses the codebase against all six decision scenarios (Phase 1,
   step 0) and ends in a **recommended course of action** chosen among them, graded on that
   scenario's scale and defended against its nearest alternative. Where the client has stated a
   decision they are actually facing, that scenario leads and the others are still covered more
   briefly. The Decision Brief must reach a recommendation — never an unresolved "sound overall,
   but work remains" formulation. Detail sections exist to make the recommendation defensible,
   not to demonstrate effort.

2. **One finding, one write-up, one ID.** Every finding has exactly one canonical write-up,
   located in Part II, and exactly one identifier. The final identifiers (`F-01`, `F-02`, …)
   are **assigned in register order** — F-01 is the highest-scoring finding, F-02 the next,
   and so on down the sorted register — so a reader scanning by ID scans by severity. Because
   rank is not known until every finding is collected, use temporary working labels
   (`W1`, `W2`, …) during investigation and stamp the final `F-nn` IDs in one pass once the
   register is built and sorted (Phase 2). Every other mention anywhere in the report is a
   one-line reference to the final ID. Never introduce a second identifier scheme (no
   separate P-xx/R-xx numbering), never restate a finding's full description in a second
   location, and never assign two IDs to one root cause.

3. **Proportionality of ink.** Text volume tracks severity and decision-value, not
   thoroughness for its own sake. A Critical finding warrants a full structured record; a Low
   finding warrants its register row plus at most two sentences anywhere else. Raw inventories
   (full dependency tables, annotation lists, per-tool scan results) belong in appendices,
   referenced from the body. Each part carries a soft word budget — Part I ~1,500, Part II as
   long as the findings require, and **Parts III and IV each no longer than Part II** — so that
   descriptive sections never rival the findings in length. Long reports are acceptable; padded
   ones are not. If Part III or IV approaches Part II's length, compress the narrative, not the
   findings. **Table content does not count against these budgets**, and compression must never
   convert a table into prose: structured, repeated data belongs in a table regardless of
   length, and collapsing it to save words destroys the scannability that makes a long report
   usable. Cut narrative, merge redundant paragraphs, or move an inventory to an appendix —
   never flatten a table.

   **Section ownership (prevents the same material appearing three times).** Each kind of
   content has exactly one home:
   - *What the condition is* → the Part II finding record only.
   - *What posture was verified and how* → the Part III/IV narrative — describing what was
     checked and what holds, not re-describing findings; findings appear as ID references.
   - *Which control a finding breaches* → the Part IV framework tables, as a row of
     control + finding ID + severity, with no restatement of the condition.
   - *Consolidation across frameworks* → IV.7 only, by ID.
   If a sentence describing a finding's substance appears outside its Part II record, delete it
   and leave the ID reference.

4. **Calibrated severity, no quotas.** Severity is assigned by the rubric below, not by
   feel, and never adjusted to fill a list. "Key findings" means *all* Critical and High
   findings — three if there are three, nine if there are nine. Strengths are recorded only
   when observed, with the same evidence discipline as defects, and with no target count.
   Never manufacture symmetry between positives and negatives.

5. **Verify, do not recall.** A fabricated CVE ID, a guessed version, or an invented line
   reference is worse than an acknowledged gap. Never state a CVE, a "latest version", a
   coverage percentage, or an EOL date from memory. Derive it from tool output or a
   registry/documentation lookup, or mark it **unverified**. See Anti-Hallucination Rules.

6. **Evidence over assertion.** Every material claim references its evidence (file path,
   line, config entry, tool output). Generic statements unsupported by direct observation
   are removed or grounded. Praise follows the same rule as criticism.

7. **Fixed compliance scope.** HIPAA, GDPR, PCI-DSS, SOC 2, OWASP Top 10, and mobile
   application security are assessed in **every** report. "Assessed" includes reaching an
   evidenced not-applicable conclusion: the applicability determination — what signals were
   looked for, what was found, and the resulting ruling — is itself a mandatory deliverable
   (Part IV). Frameworks are never silently omitted and never selected at the model's
   discretion.

8. **Fixed template, no drift.** Phase 2 defines a closed section structure. Never add,
   remove, rename, renumber, or merge sections. Engagement-specific requests from the user
   (e.g. "pay attention to EU-market entry" or "assess the AI-generation provenance in
   depth") are satisfied *inside* the owning sections, with any overflow placed in
   Appendix C — never by inventing new sections. If a section has nothing to report, it
   states "None identified" or "Not applicable — <reason>"; it is not deleted.

9. **State the boundary of static analysis.** Where something cannot be determined without
   running the system, say so explicitly and convert it into an Appendix A question rather
   than estimating without basis.

10. **Conditions, not people.** Findings describe conditions and their consequences, never
    the competence or intent of the prior team — and, for AI-generated codebases, never the
    quality of the AI tool as such. "The import at `x.ts:2` references a non-existent
    module subpath" — not "the AI hallucinated" or "the developers were careless".

---

## Anti-Hallucination Rules

These override any pressure to appear complete:

- **CVEs:** cite only identifiers appearing in tool output (osv-scanner, trivy,
  npm/pnpm/yarn audit, pip-audit, grype, OWASP Dependency-Check) or a fetched advisory.
  If no scan ran, state that dependency vulnerabilities were **not verified** and list
  observed versions only.
- **"Latest version" / EOL dates:** derive from a registry query or a fetched authoritative
  page; otherwise mark **unverified**.
- **Coverage %:** report only from a coverage run or an existing coverage report; otherwise
  "not determinable from static analysis". Never estimate a percentage.
- **Line references:** cite only `file:line` actually inspected.
- **Framework citations (HIPAA §, GDPR Art., SOC 2 CC, OWASP category):** attach a control
  reference only to a concrete violating condition with evidence, never to a vague concern.
- **Assumptions:** state each assumption an assessment rests on, with a confidence level
  (**High / Medium / Low**). Confidence appears in exactly two places: in each finding
  record (Part II) and on each framework-level conclusion (Part IV). Do not scatter
  confidence tags elsewhere.
- **A tool that did not run is not a clean result.** If a scanner failed, was blocked, or
  scanned zero files, never report or imply a clean finding from it. Record it as *not
  completed*, state why, and either substitute another method or downgrade the affected
  assurance level. Distinguish "scanned, nothing found" from "did not scan" everywhere —
  the two are recorded differently in IV.1 and Appendix B. A zero-result run is only
  meaningful once you have confirmed it actually scanned the intended files.
- Any unverifiable figure is visibly tagged **unverified** where it appears.

---

## Severity Rubric & Risk Taxonomy (used everywhere; defined only here)

Severity is a rubric ruling on the *condition*; the risk score is a separate calculation
on *likelihood × impact*. Assign both independently; if they disagree by more than one
band, add a one-line explanation in the register row.

| Severity | Criteria (any one suffices) |
|---|---|
| **Critical** | A concrete scenario **possible today** — exploitable from the code as written, or an active legal non-conformance for data actually processed — leading to unauthorized access to sensitive data, material financial loss, or regulatory action; or a condition that blocks the engagement's goal outright (e.g. unresolvable IP/ownership for a takeover, or a launch-blocking defect for a production go/no-go). The record must state the concrete scenario. |
| **High** | One failure, change, or misconfiguration away from a Critical outcome; or a legal/regulatory gap that must be closed before launch or scale in the product's actual market; or a defect that makes safe change of the system impractical. |
| **Medium** | Materially weakens posture or raises the cost/risk of ownership; harm requires a combination of factors, insider access, or growth beyond current scale. |
| **Low** | Hygiene, isolated best-practice gaps, limited blast radius. |
| **Informational** | Recommendation only; not a risk. Never enters the register. |

**Anti-inflation rules:**
- Absence-of-practice findings (no tests, no MFA, no observability, no rate limiting) cap
  at **High** unless a concrete already-realised consequence is evidenced.
- A Critical rating without a stated concrete scenario is invalid — downgrade or supply
  the scenario.
- Deliberate, documented, scale-appropriate decisions by the prior team (e.g. a documented
  pilot-stage deferral) are reported as gaps to close at the stated trigger point, with
  their standing named — not scored as if they were oversights.

**Risk score:** Likelihood (1–5) × Impact (1–5) = 1–25 → Low (1–4), Medium (5–9),
High (10–15), Critical (16–25). Impact incorporates confidentiality, integrity,
availability, and regulatory/legal exposure.

**Likelihood must be evidence-anchored.** Score Likelihood from what the code and
configuration actually show — an unguarded path, a missing check, a default value, a reachable
endpoint — not from an intuition about how often something happens. Where a score depends on
assumed actor behaviour (how many users would abuse a limit, whether an administrator account
is compromised, expected traffic growth), **state the assumption in the finding record or the
register note and cap that finding's confidence at Medium**. A Likelihood that cannot be tied
either to an observable fact or to a stated assumption is not defensible; lower it or justify
it.

**Register ordering & ID assignment (mandatory, verified in Phase 3):** the risk register
is ordered by, in strict precedence: (1) Risk score descending; (2) within an equal score,
severity band descending (Critical > High > Medium > Low); (3) within an equal band, Impact
descending; (4) anything still equal keeps a stable order (the order already established —
do not reshuffle). Final `F-nn` IDs are then assigned **in this order**: the top row is F-01,
the next F-02, and so on with no gaps, so ID order and register order are identical by
construction. Assign IDs only after the register is fully built and sorted. Every other
severity-bearing table sorts Critical → High → Medium → Low but keeps whatever IDs the
register assigned (those tables are not renumbered).

---

## Effort Estimation Rules

Estimates assume an **AI-assisted workflow** by default (AI drafts code/tests/docs; a
competent engineer designs, reviews, validates, integrates). State this assumption once,
before the estimates table.

**Anchors (engineering effort for the change itself, including its tests and review):**

| Band | Effort | Typical content |
|---|---|---|
| XS | ≤ 0.5 day | Config change, single-file fix, dependency bump |
| S | 0.5–1 day | Small bounded code change |
| M | 1–3 days | A new endpoint/module, a focused refactor, a migration |
| L | 4–10 days | A subsystem (real data-export path, RLS rollout, credential-store move) |
| XL | > 2 weeks | **Not accepted as a single estimate** — decompose into L-or-smaller items |

**Anti-inflation rules:**
- Estimate the engineering change, not project ceremony. Do not pad for coordination
  unless coordination is the actual work.
- Any estimate expressed in weeks must name the specific work that consumes those weeks.
- Calendar time is stated separately, and only where it differs from effort because an
  **external gate** exists (a vendor contract, a legal review, a third-party approval) —
  name the gate.
- Work bounded by human judgment or external parties (contract negotiation, DPIA, key
  ceremony, audits) is listed with the gate named and **no engineering-effort figure**,
  so it cannot inflate the code-work total.
- Tag each item's AI-acceleration: **High** (mechanical, well-specified), **Medium**
  (needs design/domain judgment), **Low/None** (human- or externally-bound).
- When uncertain, give a range with confidence — never round up to the next band.

---

## Language & Format Rules

- Formal, plain, measured business/engineering English (or the engagement's specified
  language). The register of a bank's audit letter, not a keynote.
- **Banned:** superlatives and drama — "best-in-class", "exceptional", "world-class",
  "crown jewels", "stop the bleeding", "the arithmetic is unforgiving", "battle-tested",
  and equivalents; rhetorical questions; exclamation marks. Emphasis is carried by
  severity, ordering, and evidence — not adjectives.
- Praise is stated factually: "RLS is enabled on all 21 tables with per-owner predicates
  (verified)" — not "disciplined, best-in-class data-access security".
- **Findings are self-contained.** Every finding description — including table cells —
  is written in full sentences a reader can parse without chasing references: the
  condition, where it was observed, and why it matters (2–4 sentences). Telegraphic
  fragments ("no CSP; env committed") are not acceptable as a finding's only description.
- Paragraphs carry one idea and stay under ~120 words. Prefer several short paragraphs
  over one dense block.
- Numbered sections exactly as in the Phase 2 template. Every material claim carries its
  file/path/line evidence.

**Tabular presentation standard.**

Use a table whenever three or more items share the same attributes — inventories, versions,
per-item status, per-item evidence. Use prose for reasoning, causality, verdicts, and anything
a reader must follow as an argument. The test: if the reader will *scan and compare*, table it;
if they must *follow a line of thought*, write it. A section is usually a table plus a short
verdict paragraph, not one or the other.

The following are **always tables**, never collapsed into prose:

| Content | Columns (minimum) |
|---|---|
| Languages and runtimes | Language/runtime · Declared version · Primary use |
| Frameworks and significant libraries | Library · Version · Role in the application |
| Code composition | Language · Files · Lines (tool-derived) |
| Scale metrics | Metric · Count (endpoints, migrations, tables, routes, services, tests) |
| Directory structure | Path · Purpose · Notes (entry points, generated content, anything surprising) |
| Environment variables and secrets | Name · Where read · Committed? · Documented? |
| Documentation inventory | Artifact · State (Present/Partial/Absent) · Note |
| Tooling | Tool · Type · Config file · Enforced in CI |
| Integration points | External system · Type · Integration approach · Resilience |
| Cross-cutting concerns | Concern · Approach observed · Evidence |
| Modules | Module · Responsibility · Cohesion · Coupling · Tests |
| Dependency health | Dependency · Declared · Latest (registry-derived or *unverified*) · Status · Notes |
| Code-level debt | Location · Nature · Maintenance impact |
| Scalability bottlenecks | Bottleneck · Evidence · Why it bites at scale · Severity · Recommendation |
| Operations capabilities | Capability (deploy, observability, alerting, backup, DR) · State · Evidence |
| Vendor and platform dependencies | Dependency · What breaks if it ends · Portability note |
| Verified strengths (I.5) | Area · What was verified · Evidence |
| Data egress | Recipient · Purpose · Data categories · Direction · Region · Agreement needed · Evidence |
| Data inventory | Category · Where held (tables/fields) · Special-category? |
| Storage and protection | Store · Encryption at rest · Key custody · Region |
| Retention | Table/store · Retention mechanism · Period · Gap |
| Annotations | Marker · Count · Locations |
| Coverage ledger | Surface · Status (Examined/Sampled/Not reached) · Note |

Keep these tables tight: a cell holding more than ~40 words means the content belongs in prose
or in a finding record. The self-contained-sentence rule for findings still applies to the
register's Finding column, which is the deliberate exception to cell brevity.

**Do not table:** the verdict and its reasoning; finding records; scenarios and impact
narratives; the critical path; anything with only one or two items; anything where the cells
would each be a paragraph. A two-row table is a list; a table of paragraphs is prose with
borders.

---

## Phase 0 — Scope, Access & Tooling Setup

Before investigating, establish and record:

- **Snapshot identity:** repository root, branch, commit hash/ref (or the absence of VCS,
  which is itself a finding), audit date. Every claim is pinned to this snapshot.
- **Access boundary:** what is and is not visible (source, CI history, infra configs,
  runtime, production data). Out-of-scope areas become explicit limitations and Appendix A
  questions.
- **Working evidence log:** create `AUDIT-NOTES.md`; record findings with `file:line`
  references as you go, tagging each with a **temporary working label** (`W1`, `W2`, …) at
  first observation — not a final `F-nn` ID, which cannot be known until every finding is
  collected and ranked. Do not hold the audit in memory before writing.
- **Coverage ledger:** maintain a table in `AUDIT-NOTES.md` listing every significant surface —
  each edge function or service, each schema/migration group, each frontend area, each
  configuration and infrastructure file — and mark each **Examined** (read in full),
  **Sampled** (partially read; say what was sampled), or **Not reached**. Update it as you go.
  This becomes Appendix B.5 and converts the report's completeness claim into something the
  reader can check. Any surface still marked *Not reached* when investigation ends is either
  examined before writing or disclosed in Appendix B.5 with the reason.

- **Scale strategy:** for large repositories, define and state a sampling strategy.
  Prioritise the highest-risk surface: authn/authz, data access, external input handling,
  secrets/config, dependency manifests, CI/CD. Never claim exhaustiveness not achieved.

### Tooling — establish the toolchain before investigating

Prefer running a tool over inspecting-and-guessing. Raw output is retained and its
findings are **enumerated and triaged in Appendix B** (see Phase 2) — a summary count in
the body is not a substitute.

**Establish availability by attempting, never by assuming.** For each tool class below, in this
order: (1) check whether it is already installed (`command -v`, `--version`); (2) if not, attempt
to install it through the available package managers (`pip`, `npm`, `brew`, distribution
packages) or fetch the released binary; (3) if installation fails, try the named alternatives in
the same class — `opengrep` where `semgrep` is unavailable, `trivy fs` where `osv-scanner` is
not obtainable, `npm audit` against the registry where neither is. Only after all of these fail
is a tool class unavailable. **Record the exact command attempted and the exact failure** for
anything you report as unavailable; "not available in the audit environment" without a
demonstrated attempt is not an acceptable statement and is checked in Phase 3. A tool that was
present but unused is a defect in the audit, not a limitation of the environment.

**Verify that a completed run actually ran.** A zero-finding result is only meaningful once you
have confirmed the tool scanned the intended files and had valid data: check the scanned-file
count, the ruleset actually loaded, and the vulnerability database's age. A scanner reporting
zero matches across zero files, or against a stale database, has produced no result at all —
treat it as *not completed* (see the anti-hallucination rules) and try the alternatives in its
class before accepting the gap.

**Mandatory tool classes and the stop rule.** These four classes are mandatory because no amount
of manual review substitutes for them at acceptable confidence:

| Class | Why mandatory |
|---|---|
| Dependency vulnerabilities (SCA) | Advisory identifiers cannot be recalled; without a scan there are no verified CVEs |
| Static analysis (SAST) | Manual review cannot claim coverage across a whole codebase |
| Secret scanning | Entropy-based detection finds what pattern-matching by hand does not |
| Line and language composition | Every scale figure in Part III depends on it |

If a mandatory class cannot be run after genuinely exhausting installation and alternatives,
**stop and report the blockage to the user rather than producing a degraded report**. Say which
class failed, the commands attempted, the exact errors, and what the report would be unable to
support — then ask whether to proceed on a stated-limitations basis or to wait for an
environment where the tool runs. Do not silently continue: an audit that quietly omits a scan
class presents manual review with the authority of tooling it never used. Proceed without a
mandatory class **only** on the user's explicit instruction, and when they so instruct, carry
the limitation into I.2, IV.1 and the Appendix B coverage ledger.

| Purpose | Preferred tools | Fallback |
|---|---|---|
| LOC & language composition | `scc`, `cloc`, `tokei` | Manual sample count, stated as approximate |
| Dependency vulnerabilities (SCA) | `osv-scanner`, `trivy fs`, `npm/pnpm/yarn audit`, `pip-audit`, `grype` | Versions only; CVEs unverified |
| SBOM | `syft` (CycloneDX/SPDX) | Manifest-derived list |
| Static analysis (SAST) | `semgrep`/`opengrep` (owasp + ci rulesets), `CodeQL` if configured | Targeted manual review, stated non-exhaustive |
| Secret scanning | `gitleaks`, `trufflehog` | Manual `grep`, stated non-exhaustive |
| IaC / container scanning | `trivy config`, `checkov` | Manual review |
| Outdated dependencies | `npm outdated` (or ecosystem equivalent), registry lookups | "Latest" marked unverified |
| Churn / bus-factor | `git log` analysis | State not analysed (e.g. no VCS history) |

Non-mandatory classes (SBOM, infrastructure scanning, outdated-dependency checks, churn
analysis) may fall back to the stated alternative, with affected findings marked unverified and
a tooling-backed pass recommended. The stop rule above applies only to the four mandatory
classes.

---

## Phase 1 — Investigation Protocol

Work through every step before writing; log findings (with working labels `W1`, `W2`, …) as
you go. Each step feeds
the Phase 2 sections noted. This phase defines what to collect; Phase 2 defines what to
write.

0. **Decision scenarios** → I.3 — the report does **not** infer a single engagement objective
   and does not narrow itself to one decision. Every audit assesses the codebase against **all
   six strategic scenarios** below and ends by recommending which road the client should take.
   Collect the evidence each one needs, so that none is answered by guesswork:
   - **Takeover / handover** — can another team own this? Ownership and intellectual property,
     documentation sufficiency, onboarding cost, platform coupling, knowledge concentration.
   - **Production go/no-go** — can this go live, or stay live, safely? Launch-blocking defects,
     legal exposure to real users, operational readiness, observability.
   - **Compliance remediation** — what closes the gap to conformance? Assessed for every
     framework in IV.2, including those not currently applicable (see below).
   - **Quality improvement** — where is the debt and what would a remediation programme fix?
     Test coverage, change safety, architecture integrity, maintainability.
   - **Acquisition / investment** — what technical risk would a buyer inherit? Everything above
     plus valuation-relevant risk: key-person dependency, licence and IP cleanliness, the
     credibility of the build as an asset.
   - **Rebuild vs continue** — is remediation cheaper than starting again? Compare the
     remediation total against a realistic rebuild estimate, and say which is smaller.
   If the client states a decision they are actually facing, that scenario is marked **primary**
   and leads the recommendation; the others are still assessed, more briefly. If no decision is
   stated, assess all six evenly and let the evidence pick the recommendation. Never invent or
   assume a client intention — the absence of a stated objective is a reason to widen the
   analysis, not to guess at one.

1. **Codebase map** → III.1, III.2 — directories and purpose; entry points; manifests;
   infra/CI files; env/config files (note committed secret-bearing files explicitly).
2. **Languages & dependencies** → III.1, III.6 — languages incl. tooling; runtime version
   constraints; prod vs dev dependencies with counts; SCA + outdated runs; flag deprecated,
   unmaintained (no release 2+ years, registry-verified), CVE-affected, or anomalously
   pinned dependencies.
3. **Scale** → III.1 — LOC per language (tool-derived, excluding vendored/build output);
   file/module/endpoint/migration/test counts; test-to-production ratio.
4. **Build & runtime reproducibility** → III.2 — full build process; can it build and
   start from repository contents alone; missing steps; undocumented prerequisites;
   README/CONTRIBUTING/CHANGELOG/setup/deploy documentation state.
5. **Architecture** → III.3 — style with justification; components and relationships;
   integration points; separation of concerns; cross-cutting concerns (logging, error
   handling, authn/authz, configuration, validation).
6. **Module-by-module** → III.4 — for each significant module: declared vs observed
   responsibility, coupling, internal quality, test coverage level, module-specific issues.
7. **Code quality & tests** → III.5 — lint/format/type-check configs and CI enforcement;
   naming; error handling; logging; TODO/FIXME/HACK/XXX inventory; duplication;
   test frameworks and types; coverage (tool-derived only); test quality sampling;
   CI gating; test-data management.
8. **Technical debt & currency** → III.6 — deprecated/EOL runtimes (EOL dates verified);
   dead code; disproportionate complexity; expected-but-absent practices.
9. **Scalability & operations** → III.7, III.8 — connection/pool budgets vs configured
   ceilings; statefulness vs horizontal scaling; rate limiting and backpressure (inbound
   and outbound, incl. LLM/third-party spend paths); unbounded queries/tables and
   retention; hot paths and the likely first bottleneck; caching; observability
   (metrics/tracing/error tracking); deployment path; backup/DR signals.
10. **Vendor & platform continuity** → III.8 — every runtime dependency on an external
    platform or gateway; what breaks if each relationship ends; repository/IP/account
    ownership signals; export and self-hosting feasibility; secrets custody.
11. **AI-build provenance** → III.9 — generator/scaffold markers; generated-vs-hand-written
    balance; AI-typical pathologies (phantom-finished features, plausible-but-wrong
    artifacts, duplicated divergent mechanisms, dead scaffolding). If no markers exist,
    the section states so in one paragraph.
12. **Cross-user exposure sweep** → IV.3, IV.5 — enumerate *every* path by which one user's
    data can reach a different principal, and assess each: administrative screens, views,
    reporting functions and support tooling; data-export and backup paths; analytics and
    telemetry; application logs and error reporting; shared caches; any AI or third-party call
    carrying another user's content. For each path record who can invoke it, what data it
    returns, whether it is minimised (redaction, pseudonymisation, aggregation), and **whether
    the access is audit-logged**. This class of exposure is easy to miss because it is
    authorised by design; run the sweep explicitly rather than relying on incidental discovery.

13. **Corrective-process evidence** → I.5, III.9 — look for signs that the codebase has been
    improved in response to feedback: linter or scanner findings acted upon, hardening
    migrations that replace an earlier weaker approach, documented accepted risks, revoked
    privileges, defence added after an incident. Record these as strengths with evidence.
    Evidence of a working corrective process is a material positive for any engagement
    objective and is routinely under-reported.

14. **Security & compliance evidence** → IV — secret scanning, SCA, SAST results;
    authn/authz mechanics (sessions, tokens, MFA, roles, unprotected endpoints); input
    validation and injection surfaces; cryptography (transport, at-rest, hashing, key
    management; flag MD5/SHA1/ECB/hardcoded keys/weak RNG); sensitive-data leakage (logs,
    errors, telemetry, third-party SDKs); dependency vulnerabilities; security logging.
15. **Framework applicability signals** → IV.1 — for each of HIPAA, GDPR, PCI-DSS, SOC 2,
    mobile security: what data and context signals were searched for (PHI and US
    covered-entity relationships; EU/UK personal and special-category data; cardholder
    data and payment flows; multi-tenant SaaS posture; native/hybrid mobile binaries),
    what was found, with evidence. OWASP Top 10 always applies.
16. **Data-flow inventory** → IV.5 — every external egress of personal or sensitive data:
    service, purpose, data categories, direction, evidence; every store of personal data
    with its protection.

---

## Phase 2 — Report Template (closed; produce exactly these parts and sections, in order)

The report has four parts and appendices. Each part opens with a one-line note of its
intended audience. Cross-references between parts use finding IDs and section numbers only.

**Before writing any part — the numbering pass.** Collect every finding from
`AUDIT-NOTES.md`, compute each one's Likelihood × Impact score, and order them by the
*Register ordering & ID assignment* rule in the taxonomy (score desc → band desc → Impact
desc → stable). Assign final `F-nn` IDs down that order with no gaps (top = F-01). Build a
one-time working-label → final-ID map (e.g. `W7 → F-01`). Write every part using the final
IDs, translating each working label through that map. Because all four parts and the
appendices reference findings by ID, doing this first is what lets ID order equal register
order throughout — do not write Part I with provisional numbers and renumber later.

---

### Part I — Decision Brief *(audience: decision maker; hard ceiling ~1,500 words)*

**Report header.** Open the document with a prominent title block before Part I: a level-one
heading giving the client and project name and the words *Codebase Audit*, a one-line subtitle
naming the deliverable, then a two-column identification table — Client / project · Repository
and reference (or the absence of version control) · Snapshot date · Audit date · Prepared by ·
Classification · Report structure. The header should be visually distinct from the body: title
block, table, horizontal rule, then Part I. Do not bury identification metadata in running
prose.

**I.0 How to read this report.** Four to six lines, no heading beyond this label: point each
audience at its part — decision maker: Part I alone; engineering lead: Part I plus the register
in II.1; developers and operators: Part III; compliance, data protection or security: Part IV;
anyone acting on a finding: its record in II.2. Note that every finding appears once, in Part
II, referenced by identifier everywhere else, and that identifiers run in descending order of
risk.

**I.1 The application.** *(Written for a reader who has never seen this product — an external
auditor, a new stakeholder, a prospective acquirer. Assume no familiarity and no access to the
running system. Three to six paragraphs, plus the tables below.)* Describe, from the code alone:

- **What it is and who it serves** — the product in two or three sentences, its users, its
  market and jurisdiction, and its apparent stage (pilot, private beta, live) with the evidence
  for that reading.
- **What it does** — the principal user-facing capabilities in plain language, as a table
  (*Capability · What the user does · Where implemented*). A reader should finish this able to
  describe the product without opening the code.
- **How it makes money**, if the code shows a commercial model — subscription, tiering,
  paywalls, free limits.
- **What data it handles** — the categories in plain terms (personal, children's data, health,
  payment, behavioural), flagging anything sensitive. This primes Part IV without duplicating
  the IV.5 inventory; keep it to a short table (*Data category · Plain description · Sensitive?*).
- **How it is built, in one paragraph** — the shape of the system in non-specialist language
  (for example: a browser application, a hosted database with per-user access rules, and a set
  of small server-side functions). Technical depth belongs in Part III; this is orientation.
- **External services it depends on** to function at all.

Write this section in plain language throughout. Where the code contradicts itself about the
product's stage or intent, say so here — it is usually significant.

**I.2 Engagement & snapshot.** What was audited and under what limits: client and project,
repository and reference (or the absence of version control, which is itself material), audit
date, and the **access boundary** as a table (in scope / out of scope, with what each exclusion
prevents). State that the audit assesses all six decision scenarios (I.3) and note any decision
the client has said they face. Then **tools run** — names, versions and completion status only,
with detail in IV.1 and enumerated results in Appendix B. If any mandatory tool class could not
be run, say so here in one line and point to IV.1; a reader must not have to reach Part IV to
learn that a scan class is missing.

**I.3 Verdict & recommended course of action.** Four elements, in this order.

*(a) Plain-language summary.* Three to five sentences stating **what** the audit concluded, with
no technical detail, no finding identifiers, no framework citations and no justification. A
non-technical reader — a founder, an investor, a board member — should be able to read only this
and know where they stand. State the condition of the codebase, whether it can continue to be
used and built on, what the most serious problem area is in ordinary words, and the recommended
road. Reserve the "why" for the paragraphs that follow; this element answers only "what".

*(b) Scenario assessment.* A table covering **all six scenarios**, whether or not the client
has raised them, so a reader can see every road and why the recommended one was chosen:

| Scenario | Grade | Position in one sentence | What it would take |
|---|---|---|---|

Each grade is drawn from that scenario's own five-point scale, and **the grade is always
written out in words as well as its number** — "(3) Significant debt — a focused programme is
warranted", never a bare "(3)". A reader must never meet a numeral whose scale has not been
shown to them.

**Precede the table with a one-line reading note** stating the convention: each scenario is
graded on its own five-point scale where **1 is the most favourable position and 5 the least**,
and the grades are not comparable between scenarios — a (2) on one scale does not mean the same
as a (2) on another.

**Follow the table with the grading legend — all six scales, every grade, every report.**
Printing only the recommended scenario's scale is insufficient: the reader is being shown six
grades and needs the range behind each to judge whether a (2) sits near the top of its scale or
in its middle. Table content does not count against Part I's word budget, so there is no reason
to abbreviate it. Present the legend as a table, one row per scenario and one column per grade,
keeping each cell to a short phrase:

| Scenario | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|

If the cells cannot be kept short enough to stay legible in that shape — roughly six words each
— use a labelled list instead, one scenario per entry with its five grades in order. Either form
is acceptable; omitting scales, or showing only the recommended one, is not.

The six scales, reproduced in the report as the legend described above:

- **Takeover / handover:** (1) Take over as-is · (2) Take over — conditional · (3) Take over —
  major investment · (4) Rebuild recommended · (5) Do not proceed (unresolvable blocker — IP,
  ownership, legal exposure).
- **Production go/no-go:** (1) Ready to ship · (2) Ready — conditional on named gating items ·
  (3) Not ready — significant work required · (4) Not ready — fundamental rework · (5) Do not
  ship (active harm or legal exposure if launched).
- **Compliance remediation:** (1) Substantially conformant · (2) Conformant after scoped
  remediation · (3) Material gaps — remediable · (4) Systemic non-conformance requiring
  redesign · (5) Cannot conform without rebuild or withdrawing a data flow.
- **Quality improvement:** (1) Healthy — discretionary improvements only · (2) Sound with
  targeted debt to address · (3) Significant debt — a focused programme is warranted · (4)
  Extensive debt materially raising change cost · (5) Debt so severe that rebuild is cheaper.
- **Acquisition / investment:** (1) Low technical risk · (2) Acquire — conditional on named
  remediation · (3) Material risk — reflect in valuation and plan · (4) High risk — substantial
  post-acquisition investment · (5) Technical position undermines the deal.
- **Rebuild vs continue:** (1) Continue — no rebuild justified · (2) Continue with a scoped
  remediation programme · (3) Continue, but budget a major investment · (4) Rebuild the affected
  subsystems · (5) Full rebuild recommended (with the cost comparison stated).

*(c) Recommendation.* Which road to take, with a confidence level, and why that road rather than
its nearest alternative — naming the alternative and the evidence that decides between them.
Where scenarios interact (compliance work that must precede a launch; version control that must
precede any handover), state the ordering. This is the analytical core of Part I and is written
in prose, not bullets.

*(d) Gating conditions and sensitivities.* The findings, by identifier, that must close to move
the recommended scenario up a grade; and **what would change the recommendation** — the
unanswered questions (by Appendix A number) whose answers could move it in either direction, and
in which direction.

Hedged formulations without a grade selection are not acceptable. A grade cited without its
scale, or a scenario left unassessed, is an error caught in Phase 3.

**I.4 Findings that drive the recommendation.** Every Critical and every High finding — no more,
no fewer — one to two sentences each, self-contained, with ID and severity. If none exist,
state so; do not promote Medium findings to fill space.

**I.5 Verified Strengths.** Sound engineering and controls confirmed during the audit, stated
factually with evidence and with no target count. Present as a table — *Area · What was
verified · Evidence* — so a reader can weigh strengths against the register at a glance. Where
a strength reflects a corrective process (Phase 1 step 13), say so: it evidences not just a
sound state but a functioning engineering practice.

**I.6 Remediation summary.** Wave names and themes, total engineering-effort range for
code-bound work, the externally-gated items listed separately with their gates, and the
critical path in two or three sentences.

**I.7 Decision-relevant open questions.** The subset of Appendix A whose answers
materially affect the verdict, one line each.

---

### Part II — Findings, Risk & Remediation *(audience: all; the canonical home of every finding)*

**II.1 Consolidated risk register.** One row per finding, ordered by the *Register ordering
& ID assignment* rule in the taxonomy (score desc → severity band desc → Impact desc →
stable). IDs run consecutively down the table — F-01 in the top row, F-02 next, no gaps and
no reordering — so the ID column reads 01, 02, 03… in sequence:

| ID | Finding (self-contained sentence) | Severity | Category | Frameworks breached | L | I | Score | Detail |
|---|---|---|---|---|---|---|---|---|

- Every finding in the report appears here exactly once; one root cause = one row listing
  all frameworks it breaches.
- The Detail column names the Part III/IV section holding a Medium or Low finding's context.
  Critical and High findings all have records in II.2, in the same order, so their cell is left
  empty rather than repeating "Record below" on every row.
- Informational items are excluded.
- If the ID column is not a clean 01, 02, 03… sequence from top to bottom, the numbering pass
  was skipped or the sort is wrong — fix before proceeding (Phase 3, check 4).

**II.2 Detailed finding records.** One structured record for **every Critical and High
finding**, in register order:

- **ID · Title · Severity · Confidence**
- **Condition** — what was observed, factually, in full sentences.
- **Evidence** — `file:line` / config / tool output references.
- **Scenario** — for Critical: the concrete path possible today; for High: the single
  failure or change that produces the Critical outcome. Grounded strictly in the evidence.
- **Impact** — business and, where applicable, compliance impact (specific controls).
- **What would lower this severity** — the specific evidence or answer that would reduce or
  retire the finding: a configuration this audit could not see, a compensating control
  elsewhere, an answered Appendix A question, or a behavioural assumption proving wrong. State
  it even when you judge it unlikely. A finding that admits no such condition is either
  genuinely irrefutable — say so and why — or overstated.
- **Remediation** — concrete steps; a short secure-pattern illustration where it helps
  (a few lines, not a rewrite).
- **Verification** — how the client confirms the fix actually landed: the test to write, the
  query to run, the log line or scan result to look for. Remediation without a check is an
  intention, not a closure criterion.
- **Effort** — band per the estimation rules, consistent with II.4.

Medium and Low findings receive no record; their register row plus the owning narrative
section's sentence or two is their complete treatment.

**II.3 Remediation strategy & sequencing.** Neutral wave names ("Wave 1 — Critical
remediation", "Wave 2 — Foundational controls", …). Per wave: finding IDs, rationale and
dependencies (foundational enablers first — e.g. a secrets manager before rotation, a test
harness before refactoring), exit criteria, and which frameworks move toward conformance.

**II.4 Effort & time estimates.** Per the Effort Estimation Rules:

| ID | Remediation task | Effort band | Calendar (only if externally gated — name the gate) | AI accel. | Confidence | Notes |
|---|---|---|---|---|---|---|

Close with the critical path, the split between code-bound and externally-gated work, and
residual risk after each wave — three short paragraphs, not a wall of text.

---

### Part III — Technical Assessment *(audience: developers and operators)*

Each section opens with a two-to-four-sentence **verdict paragraph** (what matters here and
how it bears on the decision scenarios in I.3), followed by the supporting detail. Findings surfaced in a
section appear as "Findings: F-xx, F-yy (Part II)" — one line, no restatement.

**III.1 Profile & scale.** A verdict paragraph, then **five separate tables** — do not merge
them or narrate them: (a) languages and runtimes with declared versions and primary use;
(b) frameworks and significant libraries with versions and role, covering everything a new
engineer must recognise, not a top-three summary; (c) code composition by language, files and
tool-derived lines, with a total row; (d) scale metrics — services or functions, endpoints,
migrations, database tables, routes, test files, and the test-to-production ratio; (e) the
directory structure, one row per significant path, with its purpose and a note flagging entry
points, generated content, vendored code and anything surprising. Close with one or two
sentences on whether the structure matches the architecture identified in III.3.

**III.2 Build, run & documentation.** Buildable from the repository: yes/no/partially, with
justification, commands and blockers (prose). Startable from documented instructions: same.
Then a **table of environment variables and secrets** — name, where it is read, whether it is
committed, whether it is documented — separating client-side publishable values from
server-side secrets. Then a **documentation inventory table** covering README, setup,
contributing guide, decision records, changelog, testing guide, deployment runbook,
environment reference and any maintenance docs, each marked Present/Partial/Absent with a
note. Then CI stages. Close with a documentation-sufficiency ruling in prose.

**III.3 Architecture.** Identified pattern with justification and consistency of application
(prose). Components and boundaries described precisely enough to reconstruct a diagram — a
**component table** (component · responsibility · how it communicates) where there are more
than three. Data layer: technology, access approach, schema management, anti-patterns, and
where access control is enforced. An **integration points table** (external system · type ·
integration approach · resilience) noting whether each is abstracted behind an interface or
coupled directly. A **cross-cutting concerns table** (concern · approach observed · evidence)
covering authentication and authorisation, configuration, error handling, logging, and
validation.

**III.4 Module breakdown.** A **module summary table** covering every significant module
(module · responsibility · cohesion · coupling · test coverage), followed by fuller treatment
of the highest-risk modules — declared versus observed responsibility, notable issues ("None
identified" if clean), with file references. **Scaling rule:** with more than ~12 significant
modules, table them all and give full treatment only to the highest-risk ~8, stating the
selection criterion. Size figures (lines) belong in the table where they bear on risk.

**III.5 Code quality & tests.** Consistency and style (prose); a **tooling table** (tool ·
type · config file · enforced in CI); naming; error handling (swallowed exceptions, empty
catches, propagation) with file references; logging and observability; an **annotations table**
(marker · count · locations) with the full listing in Appendix B if lengthy; a **test inventory
table** (test type · framework · file count · gated in CI) plus coverage (tool-derived or "not
determinable from static analysis") and sampled test quality — behavioural versus
implementation-coupled, assertion specificity.

**III.6 Technical debt & currency.** Dependency-health table (declared, latest —
registry-derived or unverified — status, notes; full listing in Appendix B if long);
EOL runtimes/frameworks with verified dates and the security-patch implication;
code-level debt table (location, nature, maintenance impact); expected-but-absent
practices for this project's type, scale, and domain.

**III.7 Scalability & capacity.** A **bottleneck table** is the core of this section
(bottleneck · evidence `file:line` · why it bites at scale · severity · recommendation),
covering: resource budgets against configured ceilings — show the arithmetic in the cell or
just below; statefulness versus horizontal scaling; rate limiting and backpressure on inbound
traffic and on outbound paid or limited calls, including model-inference and third-party spend
paths; unbounded queries, tables without retention, missing pagination and missing indexes on
hot paths; caching. Follow the table with a short prose passage naming the likely first
bottleneck in order, and separating design limits proven from the code from what requires a
load test to quantify.

**III.8 Operations & continuity.** An **operations capability table** (capability · state ·
evidence) covering the deployment path and its documentation, observability for production
operation (metrics, tracing, error tracking, alerting), backup and disaster recovery, and
secrets custody. Then a **vendor and platform dependency table** (dependency · what concretely
breaks if the relationship ends · portability note) covering every runtime dependency on an
external platform or gateway, followed by prose on repository, account and intellectual-property
ownership as far as visible, export and self-hosting feasibility, and the de-coupling step if
one exists. Continuity and ownership content is always
present, since the takeover, acquisition and rebuild-vs-continue scenarios in I.3 all depend on
it; where ownership is genuinely not in question, say so explicitly and briefly rather than
omitting the assessment.

**III.9 AI-build provenance.** *(Always present.)* If generation markers exist: a **markers
table** (marker · evidence `file:line` · what it indicates); the generated-versus-hand-written
balance as an estimate with confidence, in prose; and an **artifacts table** (artifact ·
location · pathology type · finding ID) covering phantom-finished features,
plausible-but-wrong artifacts, divergent duplicate mechanisms and dead scaffolding — each also
carried as a normal finding. Note explicitly what is *absent* that would indicate unreviewed
generation. If no markers exist: one paragraph stating that none were observed and what was
checked.

**III.10 Maintainability & onboarding.** Estimated time to a safe first contribution and
the friction sources in priority order; legibility hotspots (largest/most complex files
with LOC); extensibility (extension points, the pattern for adding a feature); what must
be resolved or documented before the recommended course of action in I.3 can proceed vs what is sound as-is.

---

### Part IV — Security, Data Protection & Compliance *(audience: compliance, DPO, security)*

**IV.1 Methodology & scanner results.** The tools run, with versions, scope, and rulesets;
per tool a one-paragraph account of what it reported and how the findings were triaged
(confirmed / false positive / accepted-with-reason), with the finding-by-finding
enumeration in **Appendix B** — a bare count is not sufficient. Zero-result runs state
what was scanned so the absence is meaningful. Reproducibility standard: a reviewer
re-running the tools must be able to reach the same triaged conclusions.

**IV.2 Framework applicability determination.** *(Mandatory, all six rows, every report.)*

| Framework | Ruling | Basis (signals searched, evidence found) |
|---|---|---|
| HIPAA | In scope / Not applicable | e.g. PHI signals, US covered-entity/BA relationship — cite evidence either way |
| GDPR (incl. UK GDPR) | In scope / Not applicable | EU/UK personal data; special-category (Art. 9) data flagged explicitly |
| PCI-DSS | In scope (level/SAQ) / Not applicable | Cardholder-data signals; outsourced-payment posture (e.g. SAQ-A) is a ruling, not an omission |
| SOC 2 | In scope / Not applicable | Multi-tenant SaaS / trust posture |
| Mobile security (MASVS / Mobile Top 10) | In scope / Not applicable | Native or hybrid binary present |
| OWASP Top 10 (current edition) | Always in scope | — |

**Every framework is assessed substantively, including those ruled not applicable.** A client
may commission this audit precisely to learn what a framework would demand — before entering a
new market, taking a US customer, accepting card payments directly, or facing an enterprise
buyer's security review. A ruling of "not applicable" therefore closes the *current-obligation*
question and opens the *conditional-readiness* one; it never ends the analysis. For each
not-applicable framework, IV.6 carries a short **conditional-readiness assessment**:

- **What would bring it into scope** — the concrete business event (entering the EU or US
  market, contracting with a covered entity, handling card data directly, shipping a native
  application, selling to an enterprise buyer requiring attestation).
- **How the codebase would fare if that happened** — assessed against the code as it stands,
  not deferred. Which controls the existing architecture would already satisfy, and which would
  not.
- **The principal gaps and their approximate weight**, referencing existing findings by ID
  where a current finding would also be a breach under that framework, and naming any
  additional control the framework requires that nothing in the current scope demands.

Keep each conditional-readiness assessment proportionate — a few paragraphs and a gap table, not
a full framework audit. It answers "how far are we from this, if we ever need it?", which is a
planning question, not a conformance verdict. Frameworks in scope receive the full treatment in
IV.6 instead.

**IV.3 Security posture.** Open with a **posture summary table** (area · posture · findings by
ID) covering the areas listed below, so a reviewer sees the shape before the detail; then the
prose treatment of each area. Close each area with a one-line **negative-assurance statement**
where one is warranted: what was specifically checked and found sound or absent — "no
string-built SQL was found across all 18 functions", "no weak hash, ECB mode or hardcoded key
matched in any file". A checked-and-clear result is a finding of a different sign and belongs
in the report; without it the reader cannot distinguish an area that is sound from one that was
never examined. Content: Secrets and credential management (hardcoded secrets with
paths from scan + inspection; `.gitignore` coverage; production secrets strategy);
authentication and authorization (mechanism, library vs custom, MFA, session/token
handling, enforcement consistency, unprotected endpoints, privilege-escalation paths);
input validation and injection prevention (boundary validation, parameterisation, XSS,
CSRF, uploads, SSRF); cryptography (transport, at-rest, hashing, algorithm hygiene, key
management); sensitive-data leakage (logs, errors, telemetry, third-party SDKs, debug in
production). Each area closes with its findings line (IDs only).

**IV.4 OWASP Top 10 assessment.** The current-edition category table
(Present / Absent / Indeterminate mitigation evidence, with notes), then a violations
table — every observed condition breaching a category, each written as a self-contained
sentence with evidence and severity, sorted by severity. Verify the current edition
before writing; if the embedded knowledge of the edition may be stale, check.

**IV.5 Data-flow & storage map.** *(When personal or otherwise sensitive data is processed;
otherwise "Not applicable — no personal data processing observed", with basis.)* **Four
tables**, each of which a data-protection reviewer will read on its own: (a) the **egress
table** — recipient · purpose · data categories with special-category flagged · direction ·
region (confirmed or routed to Appendix A) · agreement needed · evidence; (b) the **data
inventory** — category · where held, naming the tables and fields · special-category yes/no;
(c) the **storage and protection map** — store · encryption at rest · key custody · region;
(d) the **retention table** — table or store · retention mechanism · period · gap. Follow with
short prose on the flows warranting particular attention and the assessability boundary. This
subsection is written to stand alone for counsel or a data-protection officer.

**IV.6 Framework assessments.** **One subsection per framework in IV.2 — all six, every
report** — no framework is omitted because it was ruled not applicable.

*In-scope frameworks* get the full treatment: a violations table (control breached · condition
in a full sentence · evidence · severity), positive conformance signals stated factually, and a
conclusion carrying a confidence level. Mobile in-scope adds the MASVS control-group table and
platform checks (storage, network and pinning, platform interaction, resilience marked
Indeterminate where statically unreachable).

*Not-applicable frameworks* get the **conditional-readiness assessment** specified in IV.2:
the trigger that would bring the framework into scope, how the codebase would fare against it
today, and a gap table (*Control area · Current position · Gap if the framework applied ·
Related finding*). Open each with a one-line restatement of the not-applicable ruling and its
basis, so the subsection stands alone, then move directly to the conditional analysis. The
purpose is planning, not conformance: state plainly that no current obligation exists.

State the assessability boundary once: technical safeguards and code-visible signals are
assessable; administrative and physical safeguards are **Not Assessable — organisational** and
convert to Appendix A questions.

**IV.7 Compliance summary.** Root-cause violations consolidated (each once, listing all
frameworks breached, referencing F-nn IDs), the per-framework conformance-count table
(Controls assessed / Met / Partial / Not met / Not assessable / Confidence — enumerate in
Appendix B which controls were counted), and the priority order for closure ahead of the engagement's goal.
**Never produce a numeric compliance score** (e.g. "73/100"): a static audit cannot
support an organisational-compliance verdict, and false precision creates legal exposure.

---

### Appendices

**Appendix A — Open questions for the development team / platform owner.** Every
Not-Assessable item, ownership/contract/runtime unknown, and unverified material figure,
converted into a numbered, answerable question, grouped by topic, ordered by how much the
answer changes the risk picture. Note next to each which finding or verdict element it
re-scores.

**Appendix B — Tool output & inventories.** Per tool: the enumerated findings with triage
disposition and reasoning; plus any inventory too long for the body (full dependency
table, annotation listing, module summary overflow, controls-counted enumeration). Include a
final subsection, **the coverage ledger** from Phase 0: every significant surface with its
status — Examined, Sampled (saying what was sampled), or Not reached (saying why) — and a
closing line giving the proportion examined. This is what lets a reader judge the audit's
completeness instead of taking it on trust, and it is where an honest gap is disclosed rather
than hidden.

**Appendix C — Additional engagement notes.** Content the client explicitly requested
that exceeds the owning sections' proportionality budget. Empty in a standard engagement
("None"). This is the only place engagement-specific material may live outside the
template sections.

---

## Phase 3 — Self-Verification (mandatory before delivery)

Re-open the draft and verify each item; fix, do not annotate:

1. Every Phase 2 part, section, and subsection is present, in order, with template
   numbering; nothing added, renamed, or merged.
2. I.3 assesses **all six decision scenarios**, each with a grade written out in words as well
   as its number; the reading note states the 1-is-best convention and the non-comparability of
   scales; the grading legend prints **all six scales with all five grades each**, not only the
   recommended scenario's; the
   plain-language summary in I.3(a) contains no finding identifiers, framework citations or
   technical detail; and the recommendation names its nearest alternative, its confidence,
   gating finding IDs and the questions that would change it. No numeral appears anywhere in
   Part I whose scale has not been shown to the reader.
3. Part I.4 lists exactly the set of Critical + High findings — count it against the
   register.
4. The register contains every finding exactly once and is ordered score desc → severity
   band desc → Impact desc → stable. The ID column is a gapless 01, 02, 03… sequence from the
   top row down, and that order matches the sorted order (ID rank == register rank for every
   row). Recompute three rows at random to confirm L×I = Score and the band mapping, and
   confirm the top row is F-01 and the last row is F-<count>.
5. Every Critical and High finding has a detailed record; every Critical record states a
   concrete today-possible scenario.
6. Only one ID scheme exists in the delivered report; no working label (`W1`, `W2`, …)
   survives anywhere — every one was resolved to its final `F-nn`. Every referenced ID
   resolves to a register row, and no finding's full description appears in more than one
   place.
7. The IV.2 determination table has all six rows, each with an evidenced basis.
8. Every scanner named in IV.1 has its findings enumerated (or its zero-result scope
   stated) in Appendix B.
9. No banned phrases; sample five long paragraphs against the ~120-word guidance; no
   paragraph-length table cells; **neither Part III nor Part IV is longer than Part II**
   (compress narrative, never findings, if either is).
10. Every effort estimate uses the anchor bands; no undecomposed XL; every calendar figure
    names its external gate.
11. Every unverified figure is tagged; confidence appears only in finding records and
    framework conclusions.
12. All severity-bearing tables sort Critical → Low.
13. **Severity peer-comparability.** Read the findings at each severity band as a group and ask
    whether a client would accept them as peers. If one item is conspicuously lighter or heavier
    than its band-mates, re-score it. Do the same across the Critical/High boundary — the most
    common calibration error is a High that is really a Medium with alarming phrasing.
14. **Section ownership.** No finding's substance is described outside its Part II record; the
    Part III/IV narrative and the framework tables reference IDs only. Spot-check three findings
    by searching for their ID and confirming exactly one substantive description.
15. **Coverage ledger** is present in Appendix B, every listed surface has a status, and nothing
    remains *Not reached* without a stated reason.
16. **Evidence anchoring.** Every Critical and High record carries its "what would lower this
    severity" and "verification" lines, and every Likelihood resting on assumed behaviour states
    the assumption and is capped at Medium confidence.
17. **Tabular presentation.** Every content type in the always-tables list appears as a table,
    not as prose or a comma-separated run-on. Check III.1 specifically: five distinct tables
    (languages, libraries, composition, scale metrics, directory structure). Confirm no table was
    flattened to meet a word budget, and conversely that no two-row list or table of paragraphs
    was forced into a table that should be prose.
18. **Report header and orientation.** The title block and identification table precede Part I,
    and I.1 describes the application in plain language well enough that a reader unfamiliar with
    the product could summarise it. No engagement objective was inferred or assumed anywhere.
19. **Tooling honesty.** Every tool reported unavailable names the command attempted and the
    exact failure; no mandatory class was skipped without either the stop rule being invoked or
    the user's explicit instruction to proceed being recorded. Cross-check the tools listed in
    I.2 against IV.1 and Appendix B for consistency.
20. **Framework coverage.** IV.6 contains a subsection for all six frameworks. Every
    not-applicable framework carries its conditional-readiness assessment — trigger, current
    standing, gap table — and not merely a restated ruling.
21. **Artifacts.** `REPORT.md`, `REPORT.docx` and `REPORT.html` are all present, generated from
    the same source and identical in content. Open the HTML and confirm it is self-contained
    (no external references), that its table of contents links resolve, and that every table
    rendered as a table rather than collapsing. If the DOCX could not be produced, that is
    stated explicitly — the HTML is never a substitute for it.

---

## Output Artifacts

- `REPORT.md` — the canonical artifact and single source of truth. Both rendered formats are
  generated **from** it; never edit a rendered file directly, and never let the two renderings
  diverge in content.
- `REPORT.docx` and `REPORT.html` — **both are produced every time**, from the same Markdown
  source, meeting the shared presentation requirements below. HTML is not a fallback for a
  failed DOCX; it is a first-class deliverable in its own right, because it is what a client
  reads on a phone, forwards to counsel, or opens without Word installed.
- Raw scanner outputs retained as separate artifacts alongside the report, since Appendix B
  references them and a reviewer may re-run the tools against the same snapshot.
- `AUDIT-NOTES.md` retained as the working evidence log, including the coverage ledger (not
  delivered unless requested).

### Shared presentation requirements (apply to DOCX and HTML alike)

| Requirement | Detail |
|---|---|
| Cover / title block | Client, project, repository reference, snapshot, audit date, prepared by, "Confidential" — matching the report header block specified in Phase 2 |
| Table of contents | Auto-generated to depth 2 (parts and their numbered sections) |
| Navigation | Every finding identifier and section reference resolves — page numbers in DOCX, internal links in HTML |
| Code and paths | Monospaced styling for file paths, identifiers, commands and code fragments |
| Severity colour coding | Critical red, High orange, Medium yellow, Low grey, applied consistently in the register, finding records and every severity-bearing table |
| Risk heatmap | 5×5 likelihood × impact grid of the II.1 register, findings plotted by identifier |
| Grading legend | The I.3 scenario scales rendered as a readable table, not collapsed or truncated |
| Table integrity | Every table from the Markdown renders as a table; none flattened, none overflowing its page or viewport |
| Ordering | Parts I–IV in order, appendices after Part IV |

### Format-specific notes

**DOCX.** Generate with a document converter (e.g. pandoc). Add page numbers and a running
header or footer carrying the client name and classification. Set table styles so wide tables —
the register, the egress map, the grading legend — remain legible rather than running off the
page; landscape sections or reduced font for those tables are acceptable.

**HTML.** Produce a **standalone, self-contained file**: CSS embedded in the document, no
external stylesheets, fonts, scripts or image references, so the file can be emailed or archived
and still render years later. Include a linked table of contents with anchors to every section,
a readable measure (roughly 80–100 characters) rather than full-width text, sticky or repeated
table headers where a table is long, responsive tables that scroll or reflow rather than
overflow on a narrow screen, and print styles so a browser "print to PDF" produces a usable
document. The classification marking appears at the top of the page.

**If a converter is unavailable**, generate the HTML directly from the Markdown — it is a
mechanical transformation and is never a reason to skip the artifact — and say plainly that the
DOCX was not produced and why. Delivery is never blocked on the format step, but `REPORT.md`
and `REPORT.html` are always delivered.
