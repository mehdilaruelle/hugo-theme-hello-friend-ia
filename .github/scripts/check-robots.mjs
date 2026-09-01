// robots.txt states the AI policy twice — the groups it refuses, and the
// Content-Signal line — so the thing to assert is that they agree.
//
//   node check-robots.mjs <theme-root> <public-dir>

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] || '.';
const pub = process.argv[3] || 'public';

let bad = 0;
const fail = (msg) => { console.log(`  BAD  ${msg}`); bad++; };

// Only the shape data/aiCrawlers.yaml has. A line this cannot read is
// reported rather than skipped, because Hugo still reads it.
const known = {};
let key = null;
readFileSync(join(root, 'data/aiCrawlers.yaml'), 'utf8').split(/\r?\n/).forEach((line, i) => {
  if (!line.trim() || line.trim().startsWith('#')) return;
  const heading = line.match(/^([a-z][a-zA-Z]*):\s*(?:#.*)?$/);
  if (heading) { key = heading[1]; known[key] = []; return; }
  const item = line.match(/^\s+-\s+([A-Za-z0-9_.-]+)\s*(?:#.*)?$/);
  if (item && key) { known[key].push(item[1]); return; }
  fail(`data/aiCrawlers.yaml:${i + 1}: cannot read this line: ${line.trim()}`);
});
for (const group of ['train', 'cite']) {
  if (!known[group] || !known[group].length) fail(`data/aiCrawlers.yaml: the ${group} list is empty`);
}
// An agent in both groups gets whichever answer the file happens to state
// first.
const overlap = (known.train || []).filter((a) => (known.cite || []).includes(a));
if (overlap.length) fail(`data/aiCrawlers.yaml: ${overlap.join(', ')} is in both groups`);

const file = join(pub, 'robots.txt');
if (!existsSync(file)) { fail('no robots.txt was written'); process.exit(1); }
const text = readFileSync(file, 'utf8');

// One or more User-agent lines, then the rules for all of them. A rule closes
// the run, so the next agent line starts a new group.
const groups = [];
const sitemaps = [];
let current = null;
for (const raw of text.split(/\r?\n/)) {
  const line = raw.replace(/#.*$/, '').trim();
  if (!line) continue;
  const at = line.indexOf(':');
  if (at < 0) { fail(`robots.txt: cannot read this line: ${line}`); continue; }
  const field = line.slice(0, at).trim().toLowerCase();
  const value = line.slice(at + 1).trim();
  if (field === 'sitemap') { sitemaps.push(value); continue; }
  if (field === 'user-agent') {
    if (!current || current.rules.length) { current = { agents: [], rules: [] }; groups.push(current); }
    current.agents.push(value);
    continue;
  }
  if (!current) { fail(`robots.txt: ${field} before any User-agent`); continue; }
  current.rules.push([field, value]);
}

if (sitemaps.length !== 1) fail(`robots.txt: ${sitemaps.length} Sitemap lines, expected 1`);
if (sitemaps[0] && !sitemaps[0].endsWith('/sitemap.xml')) fail(`robots.txt: ${sitemaps[0]} is not a sitemap URL`);
if (!existsSync(join(pub, 'sitemap.xml'))) fail('robots.txt names a sitemap that was not written');
for (const g of groups) {
  if (!g.rules.length) fail(`robots.txt: ${g.agents.join(', ')} is named with no rule under it`);
}

const wildcard = groups.find((g) => g.agents.includes('*'));
if (!wildcard) fail('robots.txt: no User-agent: * group');
if (wildcard && wildcard.rules.some(([f, v]) => f === 'disallow' && v === '/')) {
  fail('robots.txt: User-agent: * is disallowed everything, which takes the site out of search');
}

// params.ai.crawlers can put any token here, so this holds only for a site
// using the generated groups — which the showcase does.
const refused = new Set();
for (const g of groups) {
  if (g.agents.includes('*')) continue;
  if (g.rules.some(([f, v]) => f === 'disallow' && v === '/')) g.agents.forEach((a) => refused.add(a));
}
for (const agent of refused) {
  if (!(known.train || []).includes(agent) && !(known.cite || []).includes(agent)) {
    fail(`robots.txt: ${agent} is refused but is in neither list in data/aiCrawlers.yaml`);
  }
}

// One switch per group, so a group is refused whole or not at all. Half of
// one is a policy nobody wrote.
const state = {};
for (const group of ['train', 'cite']) {
  const listed = (known[group] || []).filter((a) => refused.has(a));
  state[group] = listed.length === (known[group] || []).length && listed.length > 0;
  if (listed.length && !state[group]) {
    const missing = (known[group] || []).filter((a) => !refused.has(a));
    fail(`robots.txt: the ${group} group is only half refused, ${missing.join(', ')} is still allowed`);
  }
}

// Both have to agree, and both have to be there: a file that refuses crawlers
// and states no signal has said it once. A site refusing nothing needs no
// signal, which is the default demo.
const signal = (wildcard ? wildcard.rules : []).find(([f]) => f === 'content-signal');
if (!signal && refused.size) {
  fail(`robots.txt: ${refused.size} AI crawler(s) refused and no Content-Signal to say so`);
}
if (signal) {
  const parsed = {};
  for (const pair of signal[1].split(',')) {
    const m = pair.trim().match(/^([a-z-]+)=(yes|no)$/);
    if (!m) { fail(`robots.txt: cannot read this Content-Signal pair: ${pair.trim()}`); continue; }
    parsed[m[1]] = m[2] === 'yes';
  }
  for (const [name, group] of [['ai-train', 'train'], ['ai-input', 'cite']]) {
    if (!(name in parsed)) { fail(`robots.txt: Content-Signal has no ${name}`); continue; }
    if (parsed[name] === state[group]) {
      fail(`robots.txt: Content-Signal says ${name}=${parsed[name] ? 'yes' : 'no'} while the ${group} group is ${state[group] ? 'refused' : 'allowed'}`);
    }
  }
  if (!('search' in parsed)) fail('robots.txt: Content-Signal has no search');
}

if (bad) { console.log(`\n${bad} problem(s)`); process.exit(1); }
const said = ['train', 'cite'].map((g) => `${g}=${state[g] ? 'no' : 'yes'}`).join(', ');
console.log(`  ${groups.length} group(s), ${refused.size} AI crawler(s) refused`);
console.log(signal
  ? `\n  robots.txt says ${said} in its groups and in Content-Signal alike`
  : '\n  robots.txt is well formed and names a sitemap that exists');
