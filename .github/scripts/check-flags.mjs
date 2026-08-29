// Every language in data/langFlags.yaml must name a flag the theme can draw.
//
// The mapping is language code -> country code, and the two are not the same
// alphabet: Ukrainian is "uk" as a language and "ua" as a country. Getting it
// wrong is silent. translation-link.html falls back to the language code in a
// box only when the entry is *missing*; an entry that is present but names a
// flag nothing defines takes the other branch and renders an empty square —
// which is the outcome the fallback exists to prevent.
//
//   node check-flags.mjs <theme-root>

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] || '.';
const yaml = readFileSync(join(root, 'data/langFlags.yaml'), 'utf8');
const scss = readFileSync(join(root, 'assets/scss/_flag-icons.scss'), 'utf8');

const entries = [...yaml.matchAll(/^([a-z][a-z0-9-]*)\s*:\s*([a-z][a-z0-9-]*)\s*$/gm)]
  .map(([, lang, flag]) => ({ lang, flag }));

if (!entries.length) {
  console.error('no entries read from data/langFlags.yaml');
  process.exit(1);
}

const problems = [];
for (const { lang, flag } of entries) {
  if (!new RegExp('\\.fi-' + flag + '\\b').test(scss)) {
    problems.push(`${lang} -> ${flag}: no .fi-${flag} rule in assets/scss/_flag-icons.scss`);
  }
  for (const ratio of ['4x3', '1x1']) {
    const svg = join(root, 'static/flags', ratio, `${flag}.svg`);
    if (!existsSync(svg)) problems.push(`${lang} -> ${flag}: static/flags/${ratio}/${flag}.svg is missing`);
  }
}

for (const p of problems) console.error('  ' + p);
console.log(`checked ${entries.length} language-to-flag mappings`);
console.log(problems.length ? `${problems.length} problem(s)` : 'every one names a flag the theme can draw');
process.exit(problems.length ? 1 : 0);
