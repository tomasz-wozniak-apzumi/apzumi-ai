#!/usr/bin/env node
/**
 * Check how this documentation repository is wired to the code it describes.
 *
 * Two jobs, one file:
 *
 *   1. Setup prompt. Runs as a SessionStart hook (see .claude/settings.json),
 *      so its output is injected into the session's context: a fresh copy of
 *      this boilerplate cannot know which repositories it documents, so it
 *      asks instead of waiting to be told. Silent once the repo is wired.
 *
 *   2. Consistency check (--validate). `.gitmodules` and the Connected
 *      Implementation Repositories table in openspec/CONVENTIONS.md must
 *      agree; a table that lies about a path sends every future artifact at a
 *      directory that does not exist.
 *
 * Node built-ins only — no dependencies, no install step.
 *
 * Usage:
 *   node scripts/check-repos.mjs [--root .]     # hook mode: notes, exit 0
 *   node scripts/check-repos.mjs --status       # same, plus an OK line
 *   node scripts/check-repos.mjs --validate     # exit 1 when the two disagree
 *
 * Hook mode always exits 0: a failing SessionStart hook surfaces to the user
 * as an error, and a setup reminder is not an error.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const readText = (p) => readFileSync(p, 'utf8');
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();

/** Body of a '## Heading' section, or null when the heading is absent. */
function section(text, heading) {
  const m = new RegExp(`^##\\s+${heading}\\s*$`, 'm').exec(text);
  if (!m) return null;
  const rest = text.slice(m.index + m[0].length);
  const next = /^##\s+/m.exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}

/** Table rows (header and separator dropped), as arrays of cells. */
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

/** Submodules declared in .gitmodules, as { name, path, url, branch }. */
function parseGitmodules(root) {
  const file = join(root, '.gitmodules');
  if (!existsSync(file)) return [];
  const mods = [];
  let current = null;
  for (const raw of readText(file).split('\n')) {
    const line = raw.trim();
    const head = /^\[submodule\s+"(.+)"\]$/.exec(line);
    if (head) {
      current = { name: head[1] };
      mods.push(current);
      continue;
    }
    const kv = /^(\w+)\s*=\s*(.*)$/.exec(line);
    if (kv && current) current[kv[1]] = kv[2].trim();
  }
  return mods.filter((m) => m.path);
}

/** Compare clone URLs across ssh/https forms: git@h:o/r.git == https://h/o/r */
const normalizeUrl = (url) => url
  .replace(/`/g, '')
  .trim()
  .replace(/^ssh:\/\//, '')
  .replace(/^https?:\/\//, '')
  .replace(/^[^@/]+@/, '')
  .replace(':', '/')
  .replace(/\.git$/, '')
  .replace(/\/+$/, '')
  .toLowerCase();

/** A cell still holding a {placeholder}, a dash, or nothing. */
const isPlaceholder = (cell) => {
  const v = (cell ?? '').replace(/`/g, '').trim();
  return !v || /[{}<>]/.test(v) || /^[-—]$/.test(v);
};

const clean = (cell) => (cell ?? '').replace(/`/g, '').trim();

/** Platform labels from the Platform Architecture table. */
function readPlatforms(conventions) {
  const body = section(conventions, 'Platform Architecture');
  if (!body) return [];
  return tableRows(body).map((cells) => clean(cells[0])).filter((n) => n && !isPlaceholder(n));
}

function collect(root) {
  const notes = [];
  const errors = [];

  const conventionsPath = join(root, 'openspec', 'CONVENTIONS.md');
  // Not a copy of this boilerplate (or the hook fired elsewhere) — say nothing.
  if (!existsSync(conventionsPath)) return { notes, errors, skipped: true };

  const conventions = readText(conventionsPath);
  const reposSection = section(conventions, 'Connected Implementation Repositories');
  const mods = parseGitmodules(root);

  // ---- 1. Is the repository wiring declared at all? ----
  if (reposSection === null) {
    if (mods.length) {
      errors.push(
        `${mods.length} submodule(s) are declared in .gitmodules but ` +
        'openspec/CONVENTIONS.md has no "## Connected Implementation Repositories" ' +
        'section — artifacts cannot tell which repository a file path belongs to.',
      );
    }
    return { notes, errors };
  }

  const rows = tableRows(reposSection);
  const documented = rows.filter((cells) => !isPlaceholder(cells[1]));
  const saysNone = /^\s*(None|N\/A)\b/im.test(reposSection);

  if (!mods.length && !documented.length && !saysNone) {
    notes.push(
      'No implementation repositories are connected yet. This is a documentation ' +
      'repository: the code it describes is expected to be attached as git ' +
      'submodules under submodules/, and every path in an artifact is written ' +
      'relative to those.',
      'ACTION: before writing design.md or tasks.md, ask the user which ' +
      'repositories belong to this project — one per platform: the clone URL and ' +
      'the branch work happens on — and run /link-repos to wire them up. If the ' +
      'code genuinely lives in this same repository, ask them to confirm and write ' +
      '"None — the code lives in this repository." under ' +
      '"## Connected Implementation Repositories" so this stops asking.',
    );
    return { notes, errors };
  }

  // ---- 2. Do .gitmodules and the table agree? ----
  if (saysNone && mods.length) {
    errors.push(
      'CONVENTIONS.md says the code lives in this repository, but ' +
      `${mods.length} submodule(s) are declared in .gitmodules.`,
    );
  }

  const platforms = readPlatforms(conventions);
  const byPath = new Map(mods.map((m) => [m.path.replace(/\/+$/, ''), m]));
  const seen = new Set();

  for (const cells of rows) {
    const [platformCell, pathCell, urlCell, branchCell] = cells;
    // A repository that does not exist yet: empty Path, "planned" in Notes.
    // A documented gap, with nothing to cross-check.
    if (isPlaceholder(pathCell)) continue;
    const path = clean(pathCell).replace(/\/+$/, '');

    if (seen.has(path)) errors.push(`${path} is listed twice in the table.`);
    seen.add(path);

    const mod = byPath.get(path);
    if (!mod) {
      errors.push(
        `${path} is documented as a connected repository but no such submodule ` +
        'exists in .gitmodules — add it with /link-repos, or mark the row planned ' +
        'by clearing its Path.',
      );
      continue;
    }
    if (!isPlaceholder(urlCell) && mod.url && normalizeUrl(urlCell) !== normalizeUrl(mod.url)) {
      errors.push(`${path}: the table says "${clean(urlCell)}" but .gitmodules clones "${mod.url}".`);
    }
    if (!isPlaceholder(branchCell) && mod.branch && clean(branchCell) !== mod.branch) {
      errors.push(`${path}: the table says branch "${clean(branchCell)}" but .gitmodules tracks "${mod.branch}".`);
    } else if (!mod.branch) {
      errors.push(
        `${path}: no branch recorded in .gitmodules — add one so the documented ` +
        `working branch is the one checked out (git config -f .gitmodules submodule."${path}".branch <branch>).`,
      );
    }
    if (!isPlaceholder(platformCell) && platforms.length) {
      const label = clean(platformCell);
      if (!platforms.some((p) => p.toLowerCase() === label.toLowerCase())) {
        errors.push(
          `${path}: platform "${label}" is not in the Platform Architecture table ` +
          `(have: ${platforms.join(', ')}) — platform labels are used verbatim as ` +
          'artifact headings, so a variant here breaks the link to the repository.',
        );
      }
    }
  }

  for (const mod of mods) {
    const path = mod.path.replace(/\/+$/, '');
    if (!seen.has(path)) {
      errors.push(
        `submodule "${path}" is missing from the Connected Implementation ` +
        'Repositories table — an undocumented repository is one no artifact knows ' +
        'to look in.',
      );
    }
  }

  // ---- 3. Declared but never checked out ----
  // An empty submodule directory reads as "this codebase has nothing in it",
  // which is how a design ends up inventing every file it names.
  const empty = mods
    .map((m) => m.path)
    .filter((p) => !isDir(join(root, p)) || readdirSync(join(root, p)).length === 0);
  if (empty.length) {
    notes.push(
      `Submodule(s) declared but not checked out: ${empty.join(', ')}. Their ` +
      'directories are EMPTY — do not read that as an empty codebase, and do not ' +
      'write design.md or tasks.md against them.',
      'ACTION: ask the user to run `git submodule update --init --recursive` ' +
      '(and confirm they have access to those repositories) first.',
    );
  }

  return { notes, errors };
}

function main() {
  const argv = process.argv.slice(2);
  const rootIdx = argv.indexOf('--root');
  const root = resolve(rootIdx !== -1 ? argv[rootIdx + 1] : '.');
  const status = argv.includes('--status');
  const validate = argv.includes('--validate');

  const { notes, errors, skipped } = collect(root);
  if (skipped) return 0;

  // Leftover {placeholders} — cheap to spot, and worth flagging before the
  // first change is written against a half-filled boilerplate.
  if (!validate) {
    const unfilled = [];
    for (const rel of [['openspec', 'CONVENTIONS.md'], ['openspec', 'config.yaml']]) {
      const p = join(root, ...rel);
      if (existsSync(p) && /\{[A-Za-z]/.test(readText(p))) unfilled.push(rel.join('/'));
    }
    if (unfilled.length) {
      notes.push(
        `Boilerplate placeholders are still unfilled in: ${unfilled.join(', ')}. ` +
        'Offer to walk the user through SETUP.md before the first change.',
      );
    }
  }

  if (!notes.length && !errors.length) {
    if (status || validate) console.log('Repository wiring: OK');
    return 0;
  }

  if (validate) {
    for (const e of errors) console.log(`ERROR ${e}`);
    if (!errors.length) console.log('Repository wiring: OK');
    return errors.length ? 1 : 0;
  }

  console.log('[repository wiring — this project is not fully set up yet]');
  for (const e of errors) console.log(`- INCONSISTENT: ${e}`);
  for (const n of notes) console.log(`- ${n}`);
  console.log(
    '- Raise this with the user at the start of the session; do not silently work ' +
    'around it. Full checklist: SETUP.md.',
  );
  return 0;
}

process.exit(main());
