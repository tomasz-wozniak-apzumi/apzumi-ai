#!/usr/bin/env node
/**
 * Validate the apzumi-sdd conventions that the OpenSpec CLI does not know about.
 *
 * `openspec validate` covers specs and changes. It has no concept of our review
 * gate, our living regression suites, or our ADR log — those are conventions,
 * and conventions that nothing checks are conventions that rot. This checks
 * them. Node built-ins only; no dependencies, no install step.
 *
 * Usage:
 *   node scripts/apzumi-validate.mjs [--root .] [--quiet] [--no-archive-check]
 *                                    [--ui-platforms Frontend,Mobile iOS]
 *                                    [--no-e2e-platforms "Shared infrastructure"]
 *
 * --no-archive-check skips the "was this archived change ever synced?" pass,
 * for repos adopting apzumi-sdd with a back-catalogue of older archives.
 *
 * Exit code 1 if any ERROR is reported; 0 otherwise (WARNs do not fail).
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, basename, dirname, sep } from 'node:path';
import { resolve } from 'node:path';

/** Schema version this checker was written against; see main(). */
const EXPECTED_SCHEMA_VERSION = 3;

const errors = [];
const warnings = [];
const error = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

/** Drop HTML comments so template placeholders never parse as real rows. */
const stripComments = (text) => text.replace(/<!--[\s\S]*?-->/g, '');

/**
 * Parse GitHub-style table rows, dropping headers and separators.
 * A header is the row immediately above a `|---|` separator, so it is removed
 * when the separator is reached rather than guessed at by content.
 */
/**
 * Index of a named column in the first table found in `text`, or -1.
 *
 * Callers used to read Type as `cells[cells.length - 1]`, which silently
 * became a different column the moment a table grew one. Locating it by its
 * header keeps a table extensible: a project may add columns after Type
 * without every check quietly starting to validate the wrong cell.
 */
function columnIndex(text, name) {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const wanted = name.toLowerCase();
  for (let i = 0; i < lines.length - 1; i++) {
    const head = lines[i];
    const sep = lines[i + 1];
    if (!head.startsWith('|') || !head.endsWith('|')) continue;
    if (!sep.startsWith('|') || !sep.endsWith('|')) continue;
    const sepCells = sep.slice(1, -1).split('|').map((c) => c.trim());
    if (!sepCells.length || !sepCells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
    const cols = head.slice(1, -1).split('|').map((c) => c.trim().toLowerCase());
    const idx = cols.indexOf(wanted);
    if (idx !== -1) return idx;
  }
  return -1;
}

function tableRows(text) {
  const rows = [];
  let prevWasRow = false;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('|') || !line.endsWith('|')) {
      prevWasRow = false;
      continue;
    }
    const cells = line.slice(1, -1).split('|').map((c) => c.trim());
    if (cells.length && cells.every((c) => /^:?-{2,}:?$/.test(c))) {
      if (rows.length && prevWasRow) rows.pop(); // the line above a separator is the header
      prevWasRow = false;
      continue;
    }
    rows.push(cells);
    prevWasRow = true;
  }
  return rows;
}

/**
 * Split markdown into '## Heading' -> body.
 * Content before the first '## ' is returned under the key '' — a living suite
 * keeps its active table there, above the '## Retired' section.
 */
function sections(text) {
  const out = {};
  let current = '';
  let buf = [];
  for (const line of text.split('\n')) {
    const m = /^##\s+(.*?)\s*$/.exec(line);
    if (m && !line.startsWith('###')) {
      out[current] = buf.join('\n');
      current = m[1];
      buf = [];
    } else {
      buf.push(line);
    }
  }
  out[current] = buf.join('\n');
  return out;
}

const readText = (p) => readFileSync(p, 'utf8');
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();

function listDirs(dir) {
  if (!isDir(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/** Recursively find files with a given basename. */
function findFiles(dir, name, acc = []) {
  if (!isDir(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) findFiles(full, name, acc);
    else if (entry.name === name) acc.push(full);
  }
  return acc;
}

// ---------------------------------------------------------------------------
// 1. Review gate: an active change with tasks.md must have review.md == PASS
// ---------------------------------------------------------------------------
function checkReviewGate(root) {
  const changesDir = join(root, 'openspec', 'changes');
  for (const name of listDirs(changesDir)) {
    if (name === 'archive') continue;
    const where = `changes/${name}`;
    const changeDir = join(changesDir, name);
    const reviewPath = join(changeDir, 'review.md');
    const hasTasks = existsSync(join(changeDir, 'tasks.md'));

    if (!existsSync(reviewPath)) {
      if (hasTasks) {
        error(where, 'tasks.md exists but review.md does not — the review gate was skipped');
      }
      continue;
    }
    const lines = readText(reviewPath).split('\n').map((l) => l.trim()).filter(Boolean);
    const verdict = lines.length ? lines[lines.length - 1] : '';

    // The scenarios half of the same gate. A PASS recorded over an unsigned
    // tests.md means implementation is about to start against test scenarios
    // nobody agreed to — which is the thing making tests a real artifact was
    // meant to prevent. Reported here rather than in the QA checks because it
    // is the gate, not the file, that is wrong.
    const testsPath = join(changeDir, 'tests.md');
    if (verdict === 'PASS' && existsSync(testsPath)) {
      const tt = stripComments(readText(testsPath));
      const by = /^\*\*Approved by:\*\*[ \t]*(.*?)[ \t]*\*\*on:\*\*[ \t]*(.*?)[ \t]*$/m.exec(tt);
      const signed = Boolean(by && by[1].trim() && by[2].trim());
      const hasRows = /^\|\s*T\d+\s*\|/m.test(tt);
      if (hasRows && !signed) {
        error(where, 'review.md records PASS but tests.md carries no approval — ' +
          'the gate covers the scenarios too, or implementation starts on scenarios nobody signed');
      }
    }

    if (verdict === 'PASS') continue;
    if (verdict.startsWith('ESCALATED-TO-HUMAN')) {
      warn(where, 'review.md ended ESCALATED-TO-HUMAN — a human must decide before apply');
    } else if (hasTasks) {
      error(where, `tasks.md exists but review.md does not end with PASS (found "${verdict}")`);
    } else {
      warn(where, `review.md does not end with PASS (found "${verdict}")`);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Change tests.md: every row typed Regression or One-off
// ---------------------------------------------------------------------------
function checkChangeTests(root) {
  const changesDir = join(root, 'openspec', 'changes');
  for (const name of listDirs(changesDir)) {
    if (name === 'archive') continue;
    const changeDir = join(changesDir, name);
    const testsPath = join(changeDir, 'tests.md');
    if (!existsSync(testsPath)) continue;
    const where = `changes/${name}/tests.md`;
    // A skip_specs change has no capabilities; a one-line marker is correct.
    const metaPath = join(changeDir, '.openspec.yaml');
    const skipSpecs = existsSync(metaPath) && /^\s*skip_specs\s*:\s*true\s*(#.*)?$/m.test(readText(metaPath));

    const secs = sections(stripComments(readText(testsPath)));
    const caps = Object.entries(secs).filter(([k]) => k && k !== 'Retired scenarios');
    if (!caps.length && !skipSpecs) warn(where, 'no capability sections found');

    const seen = new Set();
    for (const [cap, body] of caps) {
      const typeIdx = columnIndex(body, 'Type');
      if (typeIdx === -1 && tableRows(body).length) {
        error(where, `[${cap}] table has no "Type" column header — it is located ` +
          'by name, so the header row must spell it exactly');
        continue;
      }
      for (const cells of tableRows(body)) {
        if (cells.length <= typeIdx) {
          error(where, `[${cap}] row has ${cells.length} columns but Type is column ` +
            `${typeIdx + 1}: ${cells.slice(0, 2).join(' | ')}`);
          continue;
        }
        const tid = cells[0].replace(/`/g, '').trim();
        if (!/^T\d+$/.test(tid)) {
          error(where, `[${cap}] scenario id "${tid}" is not T<n> — the sync records it ` +
            'as the suite row\'s Origin, so a malformed id breaks traceability');
        }
        const type = cells[typeIdx];
        if (type !== 'Regression' && type !== 'One-off') {
          error(where, `[${cap}] ${tid} has Type "${type}", expected "Regression" or "One-off"`);
        }
        if (seen.has(tid)) error(where, `duplicate scenario id ${tid}`);
        seen.add(tid);
      }
    }

    // tests.md headings drive where the sync writes; a heading that matches no
    // delta spec sends a suite into a folder with no capability in it.
    const specPaths = findFiles(join(changeDir, 'specs'), 'spec.md')
      .map((f) => relative(join(changeDir, 'specs'), f).split(sep).slice(0, -1).join('/'));
    if (specPaths.length && !skipSpecs) {
      for (const [cap] of caps) {
        if (!specPaths.includes(cap)) {
          error(where, `section "## ${cap}" matches no delta spec in this change ` +
            `(have: ${specPaths.join(', ')}) — the sync would write a suite into a ` +
            'capability folder that has no spec');
        }
      }
    }

    // A change that removes/modifies requirements should retire something.
    const specDir = join(changeDir, 'specs');
    const destructive = findFiles(specDir, 'spec.md')
      .some((p) => /^##\s+(REMOVED|MODIFIED)\s+Requirements/m.test(readText(p)));
    if (destructive && !('Retired scenarios' in secs)) {
      warn(where, "change has REMOVED/MODIFIED requirements but no '## Retired scenarios' " +
        'section — stale rows may survive in the living suite');
    }
  }
}

// ---------------------------------------------------------------------------
// 2b. Figma: a delta spec covering a UI platform needs a confirmed link
// ---------------------------------------------------------------------------
const DEFAULT_UI_PLATFORMS = ['Frontend', 'Mobile iOS', 'Mobile Android', 'Web'];

function checkFigma(root, uiPlatforms) {
  const changesDir = join(root, 'openspec', 'changes');
  for (const name of listDirs(changesDir)) {
    if (name === 'archive') continue;
    for (const spec of findFiles(join(changesDir, name, 'specs'), 'spec.md')) {
      const capPath = relative(join(changesDir, name, 'specs'), spec)
        .split(sep).slice(0, -1).join('/');
      const where = `changes/${name}/specs/${capPath}/spec.md`;
      const text = readText(spec);
      const touchesUi = uiPlatforms.some((pf) =>
        new RegExp(`\\*\\*${pf}\\*\\*|^##\\s+${pf}\\s*$`, 'm').test(text));
      if (!touchesUi) continue;
      const figma = /^>\s*Figma:\s*(.+)$/m.exec(text);
      if (!figma) {
        error(where, 'covers a UI platform but carries no "> Figma:" blockquote — ' +
          'add the confirmed link, or "> Figma: Not available — confirmed by <source/date>"');
      } else {
        const v = figma[1].trim();
        if (!/^Not available\b/.test(v) && !/https?:\/\//.test(v)) {
          error(where, `"> Figma: ${v}" has neither a URL nor the "Not available — ` +
            'confirmed by ..." form');
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 2c. tasks.md: E2E automation is the first task under each platform
// ---------------------------------------------------------------------------
const DEFAULT_NO_E2E_PLATFORMS = ['Shared infrastructure'];

/** Platform names from CONVENTIONS.md's Platform Architecture table. */
function readPlatforms(root) {
  const conv = join(root, 'openspec', 'CONVENTIONS.md');
  if (!existsSync(conv)) return [];
  const body = sections(stripComments(readText(conv)))['Platform Architecture'] ?? '';
  return tableRows(body)
    .map((cells) => (cells[0] ?? '').replace(/`/g, '').trim())
    .filter((name) => name && !name.includes('<'));
}

/** Parse '## N. Title' groups and their checkbox tasks. */
/**
 * Is this group heading a platform section?
 *
 * Only the HEAD of the title counts — what comes before the first dash or
 * colon, with any "N." numbering stripped. The template says a platform
 * heading names the platform, so "## 2. Web — acceptance tests" is one and
 * "## 4. The shared client — one codebase, both UI targets" is not.
 *
 * Matching the whole title punished accuracy: a project whose UI platforms
 * share one codebase writes a genuinely shared group, names both platforms in
 * the subtitle to say so, and is then told it is missing an E2E task it should
 * not have. The only recourse was to describe the group less honestly.
 */
function platformInHeading(platform, title) {
  const head = title.replace(/^\s*\d+(?:\.\d+)*\.?\s*/, '').split(/\s+[-\u2013\u2014:]\s+|:/)[0];
  // Compared as normalised words rather than a constructed pattern: a platform
  // name is prose from CONVENTIONS.md, and building a regex out of it is an
  // escaping bug waiting to happen for no benefit.
  const norm = (s) => ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
  return norm(head).includes(norm(platform));
}

/**
 * Groups and their tasks, with each task's CONTINUATION LINES folded in.
 *
 * A task is rarely one line: it carries its acceptance criterion, its
 * `[req: ...]` tag and, for an E2E task, the rows it covers. Reading only the
 * checkbox line made every check downstream blind to all of that, and the
 * failure then surfaced as a complaint about tasks.md rather than about this
 * parser — the expensive kind of wrong.
 *
 * Lines are joined with a newline so the first one stays addressable:
 * checkE2eCoverage reads the covered T-numbers from it alone.
 *
 * A task ends at the next checkbox, the next heading, or a blank line.
 */
function taskGroups(text) {
  const groups = [];
  let current = null;
  let task = null;

  const flush = () => {
    if (task !== null && current) current.tasks.push(task.join('\n').trim());
    task = null;
  };

  for (const line of text.split('\n')) {
    const h = /^##\s+(.*?)\s*$/.exec(line);
    if (h && !line.startsWith('###')) {
      flush();
      current = { title: h[1], tasks: [] };
      groups.push(current);
      continue;
    }
    const t = /^\s*-\s*\[[ xX]\]\s*(.+?)\s*$/.exec(line);
    if (t) {
      flush();
      if (current) task = [t[1]];
      continue;
    }
    // Indented, non-blank, not a new list item: a continuation of the task above.
    if (task !== null && /^\s+\S/.test(line) && !/^\s*[-*+]\s/.test(line)) {
      task.push(line.trim());
      continue;
    }
    flush();
  }
  flush();
  return groups;
}

/** Platform -> framework, from CONVENTIONS.md's Test Automation table. */
function readFrameworks(root) {
  const conv = join(root, 'openspec', 'CONVENTIONS.md');
  const map = new Map();
  if (!existsSync(conv)) return map;
  const body = sections(stripComments(readText(conv)))['Test Automation'] ?? '';
  for (const cells of tableRows(body)) {
    const platform = (cells[0] ?? '').replace(/`/g, '').trim();
    const framework = (cells[1] ?? '').replace(/`/g, '').trim();
    if (!platform || platform.includes('<')) continue;
    // An em dash is a deliberate "no stack here", not a missing value.
    const usable = framework && !framework.includes('<') && framework !== '—';
    map.set(platform, usable ? framework.toLowerCase() : null);
  }
  return map;
}

const AUTOMATION_VALUES = new Set(['automation_candidate', 'manual_only', 'needs_human_decision']);

/**
 * Parse a Decision cell into platform -> value.
 *
 * A row on one platform carries a bare value; a row spanning several carries
 * `Web: playwright · Mobile Android: manual`, because "automate here, do it by
 * hand there" is a normal answer that one value cannot express.
 */
function parseDecision(cell, platformsInRow) {
  const raw = (cell ?? '').replace(/`/g, '').trim();
  if (!raw) return { error: 'is empty' };
  if (!raw.includes(':')) {
    const v = raw.toLowerCase();
    return { byPlatform: new Map(platformsInRow.map((pf) => [pf, v])), bare: v };
  }
  const byPlatform = new Map();
  for (const part of raw.split('·')) {
    const m = /^\s*(.+?)\s*:\s*(.+?)\s*$/.exec(part);
    if (!m) return { error: 'has an unparseable part "' + part.trim() + '" - expected "<Platform>: <value>"' };
    byPlatform.set(m[1].trim(), m[2].trim().toLowerCase());
  }
  return { byPlatform };
}

/**
 * The QA half of tests.md: approval, the values a tester may write, and the
 * platform names a row may claim. This is what OpenSpec cannot know and what
 * the schema can only ask for politely.
 */
function checkQaDecisions(root) {
  const changesDir = join(root, 'openspec', 'changes');
  const platforms = readPlatforms(root);
  const frameworks = readFrameworks(root);
  const knownFrameworks = [...frameworks.values()].filter(Boolean);
  const knownDecisions = new Set(['manual', 'pending', ...knownFrameworks]);

  for (const name of listDirs(changesDir)) {
    if (name === 'archive') continue;
    const changeDir = join(changesDir, name);
    const testsPath = join(changeDir, 'tests.md');
    if (!existsSync(testsPath)) continue;
    const where = `changes/${name}/tests.md`;
    const text = stripComments(readText(testsPath));

    // Approval is two fields, filled together, by a person.
    const by = /^\*\*Approved by:\*\*[ \t]*(.*?)[ \t]*\*\*on:\*\*[ \t]*(.*?)[ \t]*$/m.exec(text);
    // A malformed signature line must not disable the rest of the file's checks.
    // It is the likeliest thing for a tester to get wrong by hand, and the row
    // checks below are exactly what they need most at that moment.
    if (!by) {
      warn(where, 'no "**Approved by:** **on:**" line - a tester has nowhere to sign. ' +
        'Both markers stay; the values go beside them');
    }
    const approvedBy = by ? by[1].trim() : '';
    const approvedOn = by ? by[2].trim() : '';
    if (Boolean(approvedBy) !== Boolean(approvedOn)) {
      error(where, `approval is half-filled (by: "${approvedBy}", on: "${approvedOn}") - ` +
        'fill both or neither, so a signature is never ambiguous');
    }
    if (approvedBy && /^@|agent|assistant|claude|skill|apzumi-/i.test(approvedBy)) {
      error(where, `"Approved by: ${approvedBy}" names a tool, not a person - ` +
        'the gate exists so the thing being reviewed cannot sign for it');
    }
    const approved = Boolean(approvedBy && approvedOn);

    for (const [cap, body] of Object.entries(sections(text))) {
      if (!cap || cap === 'Retired scenarios' || cap.startsWith('Notes')) continue;
      const typeIdx = columnIndex(body, 'Type');
      const platIdx = columnIndex(body, 'Platforms');
      const autoIdx = columnIndex(body, 'Automation');
      const decIdx = columnIndex(body, 'Decision');
      // A plain manual plan carries none of these; it is not this format and
      // not this check's business.
      if (decIdx === -1 && platIdx === -1 && autoIdx === -1) continue;

      for (const cells of tableRows(body)) {
        const tid = (cells[0] ?? '').replace(/`/g, '').trim();
        // checkChangeTests already reports a malformed id; do not double-report.
        if (!/^T\d+$/.test(tid)) continue;
        const type = typeIdx !== -1 ? cells[typeIdx] : '';

        const rowPlatforms = platIdx !== -1
          ? (cells[platIdx] ?? '').split(',').map((x) => x.replace(/`/g, '').trim()).filter(Boolean)
          : [];
        if (platIdx !== -1 && !rowPlatforms.length) {
          error(where, `[${cap}] ${tid} names no platform - the generation task cannot tell whose row it is`);
        }
        for (const pf of rowPlatforms) {
          if (platforms.length && !platforms.includes(pf)) {
            error(where, `[${cap}] ${tid} claims platform "${pf}", which is not in ` +
              `CONVENTIONS.md's Platform Architecture table (${platforms.join(', ') || 'empty'})`);
          }
        }

        if (autoIdx !== -1) {
          const a = (cells[autoIdx] ?? '').replace(/`/g, '').trim();
          if (!AUTOMATION_VALUES.has(a)) {
            error(where, `[${cap}] ${tid} has Automation "${a}", expected one of ` +
              [...AUTOMATION_VALUES].join(', '));
          }
        }

        if (decIdx === -1) continue;
        const parsed = parseDecision(cells[decIdx], rowPlatforms);
        if (parsed.error) {
          error(where, `[${cap}] ${tid} Decision ${parsed.error}`);
          continue;
        }

        for (const [pf, value] of parsed.byPlatform) {
          if (knownFrameworks.length && !knownDecisions.has(value)) {
            error(where, `[${cap}] ${tid} Decision "${value}" for ${pf} is neither "manual", ` +
              '"pending", nor a framework in CONVENTIONS.md\'s Test Automation table ' +
              `(${[...knownDecisions].join(', ')})`);
          }
          if (rowPlatforms.length && !rowPlatforms.includes(pf)) {
            error(where, `[${cap}] ${tid} decides for platform "${pf}", which the row's ` +
              'Platforms cell does not list');
          }
        }
        if (!parsed.bare) {
          for (const pf of rowPlatforms) {
            if (!parsed.byPlatform.has(pf)) {
              error(where, `[${cap}] ${tid} lists platform "${pf}" but decides nothing for it - ` +
                'a per-platform Decision must cover every platform the row claims');
            }
          }
        }

        if (approved && type === 'Regression') {
          for (const [pf, value] of parsed.byPlatform) {
            if (value === 'pending') {
              error(where, `[${cap}] ${tid} is still "pending" for ${pf} in a file signed by ` +
                `${approvedBy} - approval is file-level, so signing means every Regression row was decided`);
            }
          }
        }
      }
    }
  }
}

const E2E_LABEL = /\[E2E automation\]/;

/**
 * A locator fallback is recorded where somebody will see it, or it is an error.
 *
 * `openspec/CONVENTIONS.md` § Identifier Policy puts a project in one of two
 * worlds. Under `owned` a control with no stable identifier is a defect and the
 * generator stops; under `legacy` it falls back down the ladder and marks the
 * locator `@locator-fallback`.
 *
 * This check is what stops `legacy` becoming a quiet slide. A marker with no
 * matching row under a change's `## Identifier Debt` is a fallback nobody owns,
 * and a marker under `owned` is a policy the project only claims to have. Both
 * fail, because the failure mode they guard against is invisible: six months of
 * fallbacks accrete, every test still passes, and nothing records when the suite
 * stopped being able to survive a copy edit.
 */
function checkLocatorDebt(root) {
  const conv = join(root, 'openspec', 'CONVENTIONS.md');
  if (!existsSync(conv)) return;
  const policyMatch = /\*\*`?policy:\s*(owned|legacy)`?\*\*/i.exec(readText(conv));
  const policy = policyMatch ? policyMatch[1].toLowerCase() : 'owned';

  // Collect every marker in every configured test root.
  const roots = testRootsFromAutomationConfig(root);
  const markers = [];
  for (const rel of roots) {
    for (const file of filesUnder(join(root, rel))) {
      const text = readText(file);
      for (const m of text.matchAll(/@locator-fallback\s+([^\n]+)/g)) {
        markers.push({ file, detail: m[1].trim() });
      }
    }
  }
  if (!markers.length) return;

  if (policy === 'owned') {
    for (const { file, detail } of markers) {
      error(relPath(root, file), `@locator-fallback "${detail}" under policy: owned — ` +
        'that policy says a control without a stable identifier is a defect to fix, ' +
        'not one to route around. Add the identifier, or change the policy deliberately');
    }
    return;
  }

  // legacy: every marker needs an owner somewhere in an active change's debt table.
  const debt = [];
  const changesDir = join(root, 'openspec', 'changes');
  for (const name of listDirs(changesDir)) {
    if (name === 'archive') continue;
    const design = join(changesDir, name, 'design.md');
    if (!existsSync(design)) continue;
    const body = sections(stripComments(readText(design)))['Identifier Debt'];
    if (body) debt.push(body);
  }
  const recorded = debt.join('\n');

  for (const { file, detail } of markers) {
    // The element is the first segment of "<element> — <rung> — <why>".
    const element = detail.split(/\s+[-–—]\s+/)[0].trim();
    if (!element || !recorded.includes(element)) {
      error(relPath(root, file), `@locator-fallback "${detail}" has no row under ` +
        "any active change's ## Identifier Debt — a fallback recorded only in a " +
        'code comment reaches nobody, which is the whole reason the marker exists');
    }
  }
}

/** Test roots named by .qa-automation/config.yaml, or a sensible default. */
function testRootsFromAutomationConfig(root) {
  const cfg = join(root, '.qa-automation', 'config.yaml');
  const found = new Set();
  if (existsSync(cfg)) {
    for (const m of readText(cfg).matchAll(/^\s*(?:test_root|root):\s*["']?([^"'\n]+)["']?\s*$/gm)) {
      found.add(m[1].trim());
    }
  }
  if (!found.size) found.add('qa/automation');
  return [...found];
}

function filesUnder(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const p = join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else out.push(p);
    }
  };
  walk(dir);
  return out;
}

function relPath(root, file) {
  return file.slice(root.length + 1).split('\\').join('/');
}

/**
 * Every `[req: ...]` tag names a requirement that actually exists.
 *
 * The tag is the only traceability link a task or a scenario carries back to
 * the specification, and nothing verified it: a misremembered or invented
 * requirement name passed both validators silently, and the row looked
 * traceable while pointing at nothing. Found the hard way — a tasks.md shipped
 * with `[req: Language options are individually addressable]`, a requirement
 * that has never existed under any capability.
 *
 * A name resolves if it heads a requirement in this change's own delta specs OR
 * anywhere under openspec/specs/. Both are legitimate: a task may serve a
 * requirement the change modifies, or one it merely relies on.
 *
 * `[req: —]` is exempt. It is the deliberate marker for a scenario nobody's
 * specification asked for — an extrapolation a tester has to judge on its own
 * merits — and the whole point is that it names no requirement.
 */
function checkReqTags(root) {
  const changesDir = join(root, 'openspec', 'changes');
  for (const name of listDirs(changesDir)) {
    if (name === 'archive') continue;
    checkReqTagsFor(root, name, join(changesDir, name));
  }
}

function checkReqTagsFor(root, name, changeDir) {
  const known = new Set();
  const collect = (file) => {
    for (const m of readText(file).matchAll(/^###\s+Requirement:\s*(.+?)\s*$/gm)) {
      known.add(m[1]);
    }
  };
  for (const f of mdFilesUnder(join(root, 'openspec', 'specs'))) collect(f);
  for (const f of mdFilesUnder(join(changeDir, 'specs'))) collect(f);
  // A change with no requirement anywhere cannot have its tags checked; a
  // skip_specs change is the ordinary case and must not be flagged.
  if (!known.size) return;

  for (const artifact of ['tasks.md', 'tests.md']) {
    const file = join(changeDir, artifact);
    if (!existsSync(file)) continue;
    const where = `changes/${name}/${artifact}`;
    const seen = new Set();
    for (const m of stripComments(readText(file)).matchAll(/\[req:\s*([^\]]+?)\s*\]/g)) {
      const req = m[1];
      if (req === '—' || req === '-' || seen.has(req)) continue;
      seen.add(req);
      if (!known.has(req)) {
        error(where, `[req: ${req}] names no requirement in this change's deltas ` +
          'or in openspec/specs/ — a traceability tag that resolves to nothing is ' +
          'worse than none, because it reads as checked');
      }
    }
  }
}

/** Every .md under a directory, recursively; [] when it does not exist. */
function mdFilesUnder(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.md')) out.push(p);
    }
  };
  walk(dir);
  return out;
}

function checkE2eFirst(root, exemptPlatforms) {
  const changesDir = join(root, 'openspec', 'changes');
  const platforms = readPlatforms(root);

  for (const name of listDirs(changesDir)) {
    if (name === 'archive') continue;
    const changeDir = join(changesDir, name);
    const testsPath = join(changeDir, 'tests.md');
    const tasksPath = join(changeDir, 'tasks.md');
    // Only meaningful once both exist: no tests.md, or tasks not written yet,
    // means there is nothing to generate or nothing to order.
    if (!existsSync(testsPath) || !existsSync(tasksPath)) continue;

    // Gate on Regression rows: a change with only One-off scenarios has
    // nothing worth automating, so no generation task is expected.
    let regressionRows = 0;
    for (const [k, body] of Object.entries(sections(stripComments(readText(testsPath))))) {
      if (!k || k === 'Retired scenarios') continue;
      const typeIdx = columnIndex(body, 'Type');
      if (typeIdx === -1) continue;
      for (const cells of tableRows(body)) {
        if (cells.length > typeIdx && cells[typeIdx] === 'Regression') regressionRows++;
      }
    }
    if (!regressionRows) continue;

    const where = `changes/${name}/tasks.md`;
    const groups = taskGroups(stripComments(readText(tasksPath)));
    if (!groups.length) continue;

    let sawE2e = false;
    let matchedAnyPlatform = false;

    for (const g of groups) {
      const hasE2e = g.tasks.some((t) => E2E_LABEL.test(t));
      if (hasE2e) sawE2e = true;

      // Match the layer-2 group on the shape the template mandates, not on the
      // bare word "integration" — a platform legitimately called "Integration
      // service" would otherwise be swallowed and never checked.
      const looksLayer2 = /white-box/i.test(g.title)
        || (/\bunit\b/i.test(g.title) && /\bintegration\b/i.test(g.title));
      const platform = platforms.find((pf) => platformInHeading(pf, g.title));

      if (looksLayer2 || !platform) {
        const isLayer2 = looksLayer2
          || g.tasks.some((t) => /\[(Unit|Integration)\]/.test(t));
        if (isLayer2 && hasE2e) {
          error(where, `group "${g.title}" is the unit & integration group but contains an ` +
            '[E2E automation] task — layer 1 belongs under its platform, not here');
        }
        continue;
      }
      matchedAnyPlatform = true;
      if (exemptPlatforms.some((pf) => pf.toLowerCase() === platform.toLowerCase())) continue;

      if (!g.tasks.length) continue;
      if (!hasE2e) {
        error(where, `platform group "${g.title}" has no [E2E automation] task, but this ` +
          `change has ${regressionRows} Regression scenario(s) — generate ${platform}'s ` +
          'test code (via @apzumi-generate-test-code) before implementing it');
      } else if (!E2E_LABEL.test(g.tasks[0])) {
        error(where, `platform group "${g.title}" has an [E2E automation] task but it is not ` +
          'first — the tests must exist and fail before the implementation that turns them green');
      }
    }

    if (!matchedAnyPlatform && !sawE2e) {
      warn(where, `change has ${regressionRows} Regression scenario(s) but no ` +
        '[E2E automation] task, and no group matched a platform in CONVENTIONS.md — ' +
        'fill the Platform Architecture table so this can be checked properly');
    }

    checkE2eCoverage(root, name, changeDir, groups, platforms);
  }
}

/** T-numbers sorted numerically: "T2" before "T10", which .sort() gets wrong. */
function byTNumber(ids) {
  return [...ids].sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));
}

/**
 * A tester's decision and what gets generated must be the same set.
 *
 * Nothing linked the two before: a row could read `manual` and a task generate
 * it anyway, or read `playwright` and no task cover it. The first overrides a
 * human decision, the second loses coverage someone asked for, and both are
 * silent.
 */
function checkE2eCoverage(root, name, changeDir, groups, platforms) {
  const frameworks = readFrameworks(root);
  if (!frameworks.size || !platforms.length) {
    // Silence here would be the worst outcome: an unfilled Test Automation
    // table means every check below this line quietly does nothing, and the
    // run still reports OK. Say so once, rather than passing a project whose
    // decisions about automation were never cross-checked at all.
    warn('openspec/CONVENTIONS.md', 'Test Automation names no platform/framework pair, ' +
      'so the E2E coverage cross-check cannot run — a tester could assign a row to a ' +
      'framework and nothing would notice that no task generates it. See SETUP.md');
    return;
  }

  const where = `changes/${name}/tasks.md`;
  const testsText = stripComments(readText(join(changeDir, 'tests.md')));

  // platform -> { decided: Set<T>, manual: Set<T> }, from tests.md
  const perPlatform = new Map();
  for (const [cap, body] of Object.entries(sections(testsText))) {
    if (!cap || cap === 'Retired scenarios' || cap.startsWith('Notes')) continue;
    const typeIdx = columnIndex(body, 'Type');
    const platIdx = columnIndex(body, 'Platforms');
    const decIdx = columnIndex(body, 'Decision');
    if (platIdx === -1 || decIdx === -1) return; // not this format; nothing to cross-check

    for (const cells of tableRows(body)) {
      const tid = (cells[0] ?? '').replace(/`/g, '').trim();
      if (!/^T\d+$/.test(tid)) continue;
      // One-off rows are never automated, whatever the decision says.
      if (typeIdx !== -1 && cells[typeIdx] !== 'Regression') continue;
      const rowPlatforms = (cells[platIdx] ?? '').split(',')
        .map((x) => x.replace(/`/g, '').trim()).filter(Boolean);
      const parsed = parseDecision(cells[decIdx], rowPlatforms);
      if (parsed.error) continue; // already reported by checkQaDecisions
      for (const [pf, value] of parsed.byPlatform) {
        if (!perPlatform.has(pf)) perPlatform.set(pf, { decided: new Set(), manual: new Set() });
        const bucket = perPlatform.get(pf);
        if (value === frameworks.get(pf)) bucket.decided.add(tid);
        else if (value === 'manual') bucket.manual.add(tid);
      }
    }
  }
  if (!perPlatform.size) return;

  for (const [pf, bucket] of perPlatform) {
    const group = groups.find((g) => platformInHeading(pf, g.title));
    const e2eTasks = group ? group.tasks.filter((x) => E2E_LABEL.test(x)) : [];
    const covered = new Set();
    // Only a task's FIRST line names what it covers. The prose below is free to
    // say which rows it deliberately does NOT generate — and a task that explains
    // its omissions beats one that leaves them looking like an oversight, so those
    // must not be counted as coverage.
    for (const task of e2eTasks) {
      const head = task.split('\n')[0];
      for (const m of head.matchAll(/\bT\d+\b/g)) covered.add(m[0]);
    }

    if (bucket.decided.size && !e2eTasks.length) {
      error(where, `${byTNumber(bucket.decided).join(', ')} were assigned to ` +
        `${frameworks.get(pf)} for ${pf}, but there is no [E2E automation] task under that ` +
        'platform — a decision to automate that generates nothing is worse than no decision');
      continue;
    }
    if (!e2eTasks.length) continue;

    const missing = byTNumber([...bucket.decided].filter((x) => !covered.has(x)));
    if (missing.length) {
      error(where, `${pf}'s [E2E automation] task does not cover ${missing.join(', ')}, ` +
        `which a tester assigned to ${frameworks.get(pf)}`);
    }
    const overreach = byTNumber([...covered].filter((x) => bucket.manual.has(x)));
    if (overreach.length) {
      error(where, `${pf}'s [E2E automation] task covers ${overreach.join(', ')}, which a ` +
        'tester marked `manual` — generating it overrides a human decision');
    }
    const undecided = byTNumber([...covered].filter(
      (x) => !bucket.decided.has(x) && !bucket.manual.has(x)));
    if (undecided.length) {
      error(where, `${pf}'s [E2E automation] task covers ${undecided.join(', ')}, which is ` +
        'not a Regression row decided for this platform — check the T-numbers on ' +
        "the task's first line, which is where coverage is read from");
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Living regression suites under openspec/specs/**/tests.md
// ---------------------------------------------------------------------------
function checkLivingSuites(root) {
  const specsRoot = join(root, 'openspec', 'specs');
  const prefixOwners = new Map(); // prefix -> capability path that used it
  for (const suite of findFiles(specsRoot, 'tests.md')) {
    const capDir = dirname(suite);
    const capPath = relative(specsRoot, capDir).split(sep).join('/');
    const where = `specs/${capPath}/tests.md`;
    const expected = basename(capDir).replace(/[^A-Za-z0-9]+/g, '-').toUpperCase().replace(/^-|-$/g, '');

    // `retire_capabilities: true` deletes a capability's spec.md at archive but
    // leaves our co-located suite behind — a live test plan for behaviour that
    // no longer exists.
    const hasSpec = existsSync(join(capDir, 'spec.md'));

    const secs = sections(stripComments(readText(suite)));
    const active = new Set();
    const retired = new Set();

    for (const [name, body] of Object.entries(secs)) {
      // key '' is the preamble, where the active table lives
      const isRetired = name.trim().toLowerCase() === 'retired';
      for (const cells of tableRows(body)) {
        const tid = cells[0].replace(/`/g, '').trim();
        if (!/^[A-Z0-9-]+-T\d+$/.test(tid)) {
          error(where, `scenario id "${tid}" is not <PREFIX>-T<n>`);
          continue;
        }
        const prefix = tid.slice(0, tid.lastIndexOf('-T'));
        if (prefix !== expected) {
          error(where, `${tid} uses prefix "${prefix}", expected "${expected}" ` +
            `(from capability folder "${basename(capDir)}")`);
        }
        if (active.has(tid) || retired.has(tid)) error(where, `duplicate scenario id ${tid}`);
        (isRetired ? retired : active).add(tid);
        if (!isRetired && cells.length < 6) {
          error(where, `${tid}: row has ${cells.length} columns, expected 6 ` +
            '(#, Scenario, Steps, Expected Result, Source, Origin)');
        } else if (!isRetired && !/^T\d+$/.test(cells[5].replace(/`/g, '').trim())) {
          error(where, `${tid}: Origin is "${cells[5]}", expected the source ` +
            "change's own scenario number (e.g. T4)");
        }
      }
    }
    if (!active.size && !retired.size) warn(where, 'suite file has no scenario rows');

    // Two capabilities sharing a last segment (identity/user-auth and
    // admin/user-auth) would mint the same prefix and collide once a QA tool
    // aggregates suites, even though each file is internally consistent.
    if (active.size || retired.size) {
      const owner = prefixOwners.get(expected);
      if (owner && owner !== capPath) {
        error(where, `prefix "${expected}" is already used by specs/${owner}/tests.md — ` +
          'two capabilities sharing a last path segment produce colliding scenario ids');
      } else {
        prefixOwners.set(expected, capPath);
      }
    }
    if (!hasSpec && active.size) {
      error(where, `${active.size} active scenario(s) but the capability has no ` +
        'spec.md — it was retired (retire_capabilities) or never synced. Retire ' +
        'the whole suite or delete the folder; QA is still being asked to run these');
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Archived changes: did their knowledge actually reach the living docs?
// ---------------------------------------------------------------------------
function checkArchivedSync(root) {
  const archiveDir = join(root, 'openspec', 'changes', 'archive');
  if (!isDir(archiveDir)) return;

  // Every Source value present anywhere in the living suites. Column position
  // differs by section, so index deliberately rather than taking the last cell:
  //   active  | # | Scenario | Steps | Expected Result | Source | Origin |  -> [4]
  //   retired | # | Scenario | Reason | Retired by |                        -> last
  const syncedSources = new Set();
  for (const suite of findFiles(join(root, 'openspec', 'specs'), 'tests.md')) {
    for (const [secName, body] of Object.entries(sections(stripComments(readText(suite))))) {
      const isRetired = secName.trim().toLowerCase() === 'retired';
      for (const cells of tableRows(body)) {
        const raw = isRetired ? cells[cells.length - 1] : cells[4];
        const src = raw?.replace(/`/g, '').trim();
        if (src) syncedSources.add(src);
      }
    }
  }

  // Every Change value present in the ADR log.
  const adrChanges = new Set();
  const decisions = join(root, 'openspec', 'decisions');
  if (isDir(decisions)) {
    for (const f of readdirSync(decisions)) {
      if (!f.endsWith('.md') || f === 'README.md') continue;
      const m = /^-\s+\*\*Change:\*\*\s*(.+?)\s*$/m.exec(readText(join(decisions, f)));
      if (m) adrChanges.add(m[1].trim());
    }
  }

  for (const dirName of listDirs(archiveDir)) {
    // archive dirs are YYYY-MM-DD-<change-name>
    const name = dirName.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    const changeDir = join(archiveDir, dirName);
    const where = `changes/archive/${dirName}`;

    const testsPath = join(changeDir, 'tests.md');
    if (existsSync(testsPath)) {
      const secs = sections(stripComments(readText(testsPath)));
      let regressionRows = 0;
      for (const [k, body] of Object.entries(secs)) {
        if (!k || k === 'Retired scenarios') continue;
        for (const cells of tableRows(body)) {
          if (cells.length >= 5 && cells[cells.length - 1] === 'Regression') regressionRows++;
        }
      }
      if (regressionRows && !syncedSources.has(name)) {
        error(where, `archived with ${regressionRows} Regression scenario(s) but none ` +
          'appear in any living suite — apzumi-sync-knowledge was never run for it, ' +
          'so those tests are lost to the archive');
      }
    }

    const designPath = join(changeDir, 'design.md');
    if (existsSync(designPath)) {
      const body = sections(stripComments(readText(designPath)))['Decisions & Trade-offs'] ?? '';
      const decisionBlocks = (body.match(/^###\s+\S/gm) ?? []).length;
      if (decisionBlocks && !adrChanges.has(name)) {
        error(where, `archived with ${decisionBlocks} decision block(s) but no ADR cites ` +
          'it — apzumi-sync-knowledge was never run for it, so that rationale is ' +
          'lost to the archive');
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 4. ADR log: numbering, required fields, supersede links, index parity
// ---------------------------------------------------------------------------
function checkAdrs(root) {
  const decisions = join(root, 'openspec', 'decisions');
  if (!isDir(decisions)) return;

  const adrs = new Map();
  for (const file of readdirSync(decisions).sort()) {
    if (!file.endsWith('.md') || file === 'README.md') continue;
    const m = /^(\d{4})-/.exec(file);
    if (!m) {
      error(`decisions/${file}`, 'filename must start with NNNN-');
      continue;
    }
    const num = parseInt(m[1], 10);
    if (adrs.has(num)) {
      error(`decisions/${file}`, `duplicate ADR number ${m[1]} (also ${basename(adrs.get(num))})`);
      continue;
    }
    adrs.set(num, join(decisions, file));
  }

  if (adrs.size) {
    const max = Math.max(...adrs.keys());
    for (let i = 1; i <= max; i++) {
      if (!adrs.has(i)) error('decisions/', `gap in ADR numbering: ${String(i).padStart(4, '0')} missing`);
    }
  }

  const statuses = new Map();
  for (const num of [...adrs.keys()].sort((a, b) => a - b)) {
    const path = adrs.get(num);
    const where = `decisions/${basename(path)}`;
    const text = readText(path);
    for (const field of ['Status', 'Date', 'Change', 'Capabilities']) {
      if (!new RegExp(`^-\\s+\\*\\*${field}:\\*\\*`, 'm').test(text)) {
        error(where, `missing required field '${field}'`);
      }
    }
    for (const heading of ['Context', 'Decision', 'Alternatives Considered', 'Consequences']) {
      if (!text.includes(`## ${heading}`)) error(where, `missing section '## ${heading}'`);
    }
    const sm = /^-\s+\*\*Status:\*\*\s*(.+?)\s*$/m.exec(text);
    const status = sm ? sm[1] : '';
    statuses.set(num, status);
    const sup = /^Superseded by \[(\d{4})\]/.exec(status);
    if (sup && !adrs.has(parseInt(sup[1], 10))) {
      error(where, `Status points at ADR ${sup[1]} which does not exist`);
    }
    if (status && status !== 'Accepted' && !sup) {
      warn(where, `unrecognised Status "${status}" (expected "Accepted" or "Superseded by [NNNN](...)")`);
    }
  }

  const readmePath = join(decisions, 'README.md');
  if (!existsSync(readmePath)) {
    if (adrs.size) error('decisions/', 'README.md index is missing');
    return;
  }
  const indexed = new Map();
  const indexBody = sections(stripComments(readText(readmePath)))['Index'] ?? '';
  for (const cells of tableRows(indexBody)) {
    const m = /\[(\d{4})\]/.exec(cells[0] ?? '');
    if (m) indexed.set(parseInt(m[1], 10), cells[2] ?? '');
  }
  for (const num of [...adrs.keys()].sort((a, b) => a - b)) {
    if (!indexed.has(num)) {
      error('decisions/README.md', `ADR ${String(num).padStart(4, '0')} exists but is not in the Index table`);
    }
  }
  for (const num of [...indexed.keys()].sort((a, b) => a - b)) {
    if (!adrs.has(num)) {
      error('decisions/README.md', `Index lists ADR ${String(num).padStart(4, '0')} but no such file exists`);
    }
  }
  for (const num of [...adrs.keys()].sort((a, b) => a - b)) {
    if (!indexed.has(num)) continue;
    const idx = indexed.get(num);
    const real = statuses.get(num);
    if (idx && real && idx !== real) {
      error('decisions/README.md',
        `ADR ${String(num).padStart(4, '0')} Status is "${real}" but the Index says "${idx}"`);
    }
  }
}

// ---------------------------------------------------------------------------

/**
 * "Archived when specified, implemented AND TESTED" — the last word of that is
 * what this checks.
 *
 * A change whose scenarios a tester assigned to a framework, archived with no
 * run behind them, becomes documentation claiming behaviour nobody verified.
 * Nothing else notices: the specs merge, the suite gains rows, and the rows
 * have never run.
 *
 * The link between a change and a run is the durable suite id its tests are
 * named for (`task-filters` + T3 -> TASK-FILTERS-T3), so this looks for that
 * id in the committed results. That makes it opt-in: a project passes
 * --results-dir once it commits results, and gets nothing until it does,
 * rather than a false alarm.
 */
function checkArchivedTested(root, resultsDir) {
  const archiveDir = join(root, 'openspec', 'changes', 'archive');
  if (!isDir(archiveDir)) return;

  const abs = resolve(root, resultsDir);
  if (!isDir(abs)) {
    warn('scripts/apzumi-validate.mjs',
      `--results-dir "${resultsDir}" is not a directory — nothing to check test evidence against`);
    return;
  }
  const haystack = readTreeText(abs);

  for (const name of listDirs(archiveDir)) {
    const testsPath = join(archiveDir, name, 'tests.md');
    if (!existsSync(testsPath)) continue;
    const where = `changes/archive/${name}/tests.md`;
    const text = stripComments(readText(testsPath));

    const wanted = [];
    for (const [cap, body] of Object.entries(sections(text))) {
      if (!cap || cap === 'Retired scenarios' || cap.startsWith('Notes')) continue;
      const typeIdx = columnIndex(body, 'Type');
      const platIdx = columnIndex(body, 'Platforms');
      const decIdx = columnIndex(body, 'Decision');
      if (decIdx === -1) continue;
      const prefix = cap.split('/').pop().toUpperCase().replace(/[^A-Z0-9]+/g, '-');
      for (const cells of tableRows(body)) {
        const tid = (cells[0] ?? '').replace(/`/g, '').trim();
        if (!/^T\d+$/.test(tid)) continue;
        if (typeIdx !== -1 && cells[typeIdx] !== 'Regression') continue;
        const rowPlatforms = platIdx !== -1
          ? (cells[platIdx] ?? '').split(',').map((x) => x.replace(/`/g, '').trim()).filter(Boolean)
          : [];
        const parsed = parseDecision(cells[decIdx], rowPlatforms);
        if (parsed.error) continue;
        const automated = [...parsed.byPlatform.values()]
          .some((v) => v !== 'manual' && v !== 'pending');
        if (automated) wanted.push(`${prefix}-${tid}`);
      }
    }
    if (!wanted.length) continue;

    const seen = wanted.filter((id) => haystack.includes(id));
    if (!seen.length) {
      error(where, `archived with ${wanted.length} scenario(s) assigned to a framework ` +
        `(${byTNumber(wanted.map((x) => x.slice(x.lastIndexOf('-') + 1))).join(', ')}) but no ` +
        `committed run under ${resultsDir} mentions any of them — a change nobody tested is not ` +
        'ready to become documentation');
    }
  }
}

/** Every text file under a directory, concatenated. Used to look for ids. */
function readTreeText(dir) {
  let out = '';
  const walk = (d) => {
    let entries = [];
    try { entries = readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(xml|json|ya?ml|md|txt|csv)$/i.test(e.name)) out += readText(full);
    }
  };
  walk(dir);
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  const quiet = argv.includes('--quiet');
  const rootIdx = argv.indexOf('--root');
  const root = resolve(rootIdx !== -1 ? argv[rootIdx + 1] : '.');

  if (!isDir(join(root, 'openspec'))) {
    console.error(`No openspec/ directory under ${root}`);
    return 2;
  }

  // A project that copied newer tooling but an older schema will silently run
  // on stale instructions; catch the mismatch rather than letting it drift.
  const schemaPath = join(root, 'openspec', 'schemas', 'apzumi-sdd', 'schema.yaml');
  if (existsSync(schemaPath)) {
    const m = /^version:\s*(\d+)\s*$/m.exec(readText(schemaPath));
    const found = m ? parseInt(m[1], 10) : null;
    if (found === null) {
      warn('openspec/schemas/apzumi-sdd/schema.yaml', 'no parseable `version:` line');
    } else if (found < EXPECTED_SCHEMA_VERSION) {
      warn('openspec/schemas/apzumi-sdd/schema.yaml',
        `schema is v${found} but this checker ships with v${EXPECTED_SCHEMA_VERSION} — ` +
        'pull the newer schema from the template (see SETUP.md, "Updating apzumi-sdd")');
    }
  }

  const uiIdx = argv.indexOf('--ui-platforms');
  const uiPlatforms = uiIdx !== -1
    ? argv[uiIdx + 1].split(',').map((x) => x.trim()).filter(Boolean)
    : DEFAULT_UI_PLATFORMS;

  const noE2eIdx = argv.indexOf('--no-e2e-platforms');
  const exemptPlatforms = noE2eIdx !== -1
    ? argv[noE2eIdx + 1].split(',').map((x) => x.trim()).filter(Boolean)
    : DEFAULT_NO_E2E_PLATFORMS;

  // Default to qa/results when it exists, rather than requiring the flag.
  // CI passed --results-dir and a developer's bare run did not, so the archive
  // evidence check ran in one place and silently skipped in the other — two
  // changes were archived with no committed run and only GitHub noticed. A
  // check that answers differently depending on how it was invoked is the
  // failure mode this file exists to catch, so it should not have it itself.
  const resultsIdx = argv.indexOf('--results-dir');
  const defaultResults = existsSync(join(root, 'qa', 'results')) ? 'qa/results' : null;
  const resultsDir = resultsIdx !== -1 ? argv[resultsIdx + 1] : defaultResults;

  checkReviewGate(root);
  checkChangeTests(root);
  checkQaDecisions(root);
  checkFigma(root, uiPlatforms);
  checkE2eFirst(root, exemptPlatforms);
  checkReqTags(root);
  checkLocatorDebt(root);
  checkLivingSuites(root);
  checkAdrs(root);
  if (!argv.includes('--no-archive-check')) {
    checkArchivedSync(root);
    if (resultsDir) checkArchivedTested(root, resultsDir);
  }

  if (!quiet) for (const w of warnings) console.log(`WARN  ${w}`);
  for (const e of errors) console.log(`ERROR ${e}`);

  if (errors.length) {
    console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
    return 1;
  }
  if (!quiet) console.log(`apzumi-sdd conventions OK (${warnings.length} warning(s))`);
  return 0;
}

process.exit(main());
