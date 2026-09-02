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
function taskGroups(text) {
  const groups = [];
  let current = null;
  for (const line of text.split('\n')) {
    const h = /^##\s+(.*?)\s*$/.exec(line);
    if (h && !line.startsWith('###')) {
      current = { title: h[1], tasks: [] };
      groups.push(current);
      continue;
    }
    const t = /^\s*-\s*\[[ xX]\]\s*(.+?)\s*$/.exec(line);
    if (t && current) current.tasks.push(t[1]);
  }
  return groups;
}

const E2E_LABEL = /\[E2E automation\]/;

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
      const platform = platforms.find((pf) =>
        new RegExp(`\\b${pf.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(g.title));

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

  checkReviewGate(root);
  checkChangeTests(root);
  checkFigma(root, uiPlatforms);
  checkE2eFirst(root, exemptPlatforms);
  checkLivingSuites(root);
  checkAdrs(root);
  if (!argv.includes('--no-archive-check')) checkArchivedSync(root);

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
