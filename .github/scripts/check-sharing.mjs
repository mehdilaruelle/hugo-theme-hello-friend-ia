// Asserts that every sharing link parses into the parameters it means.
//
// The values themselves are escaped by Go's contextual auto-escaping inside an
// href, so encoding is not the risk. The risk is a separator that is not one:
// a literal ";" between parameters swallows everything after it into the
// preceding value, and the build says nothing.
//
//   node .github/scripts/check-sharing.mjs <public-dir>

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const PROVIDERS = /facebook|twitter|tumblr|pinterest|linkedin|reddit|xing|telegram|vk\.com|whatsapp|hacker/i;

// Quoted, single-quoted or bare. The demo deploys with --minify, which drops
// the quotes around any attribute value that does not need them, so a pattern
// that required them checked 128 of the showcase's 136 sharing links and said
// nothing about the eight it never saw. Same shape as ATTR in check-links.mjs.
const HREF = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (full.endsWith(".html")) yield full;
  }
}

const root = process.argv[2] || "public";
const failures = [];
let checked = 0;
const seen = new Set();

for (const file of walk(root)) {
  const html = readFileSync(file, "utf8").replace(/\n/g, " ");
  for (const m of html.matchAll(HREF)) {
    const raw = (m[1] ?? m[2] ?? m[3] ?? "").replace(/&amp;/g, "&");
    if (!raw.startsWith("https://")) continue;
    if (!PROVIDERS.test(raw)) continue;
    let url;
    try { url = new URL(raw); } catch { failures.push([file, raw, "not a valid URL"]); continue; }
    checked++;
    for (const [key, value] of url.searchParams) {
      // A parameter value holding "=" after a ";" is a separator that was never
      // one: the next parameter has been absorbed.
      if (/;[^;=]*=/.test(value)) {
        const k = `${url.host}|${key}`;
        if (!seen.has(k)) { seen.add(k); failures.push([file, `${url.host} ?${key}=`, "a ';' separator swallowed the parameters after it"]); }
      }
    }
  }
}

console.log(`checked ${checked} sharing links`);
if (failures.length) {
  console.error(`\n${failures.length} broken:\n`);
  for (const [file, what, why] of failures) console.error(`  ${file}\n    ${what}  (${why})`);
  process.exit(1);
}
console.log("every parameter is separated by an ampersand");
