// Every language in data/langFlags.yaml must name a flag the theme can draw.
//
// A language code is not a country code — Ukrainian is uk, Ukraine is ua — and
// naming the wrong one renders an empty square rather than falling back to the
// language code, because translation-link.html only falls back when the entry
// is missing.
//
//   node check-flags.mjs <theme-root>

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] || '.';

// Named rather than thrown: a wrong theme root is the common way to get here,
// and an ENOENT stack trace does not say which path was wrong.
const read = (path) => {
  const full = join(root, path);
  if (!existsSync(full)) {
    console.error(`  no ${full}: is ${root} the theme root?`);
    process.exit(1);
  }
  return readFileSync(full, 'utf8');
};

const yaml = read('data/langFlags.yaml');
const scss = read('assets/scss/_flag-icons.scss');

const problems = [];
const entries = [];

// Every data line has to be understood. Reporting what could not be read is the
// point: a mapping this script skips is still one Hugo uses.
yaml.split(/\r?\n/).forEach((line, i) => {
  if (!line.trim() || line.trim().startsWith('#')) return;
  const m = line.match(/^\s*([a-z][a-z0-9-]*)\s*:\s*["']?([a-z][a-z0-9-]*)["']?\s*(?:#.*)?$/);
  if (!m) problems.push(`data/langFlags.yaml:${i + 1}: cannot read this line: ${line.trim()}`);
  else entries.push({ lang: m[1], flag: m[2] });
});

for (const { lang, flag } of entries) {
  // Not \b: it matches before a hyphen, so .fi-es-ct would answer for .fi-es.
  if (!new RegExp('\\.fi-' + flag + '(?![a-z0-9-])').test(scss)) {
    problems.push(`${lang} -> ${flag}: no .fi-${flag} rule in assets/scss/_flag-icons.scss`);
  }
  for (const ratio of ['4x3', '1x1']) {
    if (!existsSync(join(root, 'static/flags', ratio, `${flag}.svg`))) {
      problems.push(`${lang} -> ${flag}: static/flags/${ratio}/${flag}.svg is missing`);
    }
  }
}

for (const p of problems) console.error('  ' + p);

// A file that is present and says nothing: every assertion above is vacuously
// true over no entries, and the run reads as a pass.
if (entries.length === 0) {
  console.error(`  no mappings read from ${join(root, 'data/langFlags.yaml')}`);
  process.exit(1);
}

console.log(`checked ${entries.length} language-to-flag mappings`);
console.log(problems.length ? `${problems.length} problem(s)` : 'every one names a flag the theme can draw');
process.exit(problems.length ? 1 : 0);
