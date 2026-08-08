// Asserts that the maths on the showcase reached the page intact.
//
// The build succeeds either way: without the passthrough extension Goldmark
// quietly turns "," into a comma and wraps the block in a paragraph, and the
// page still renders — as prose. Only an assertion on the built HTML catches it.
//
//   node .github/scripts/check-math.mjs <public-dir>
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const BS = String.fromCharCode(92);           // a real backslash, no escaping games
const INLINE = BS + "(a^2 + b^2 = c^2" + BS + ")";
const BLOCK  = BS + "int_0^" + BS + "infty e^{-x}" + BS + ",dx = 1";

const root = process.argv[2] || "public";
const langs = { en: "", fr: "fr/", ja: "ja/", ar: "ar/" };
let bad = 0;
for (const [lang, prefix] of Object.entries(langs)) {
  const dir = join(root, prefix, "posts/2026/01");
  const file = readdirSync(dir)
    .map(d => join(dir, d, "index.html"))
    .filter(f => existsSync(f))
    .find(f => readFileSync(f, "utf8").includes("katex"));
  const s = readFileSync(file, "utf8");
  const inline = s.includes(INLINE);
  const block = s.includes(BLOCK);
  const paragraph = /<p>\$\$/.test(s);
  if (!inline || !block || paragraph) bad++;
  console.log(`  ${lang.padEnd(3)} inline ${inline ? "ok " : "BAD"}   block ${block ? "ok " : "BAD"}   wrapped-in-p ${paragraph ? "BAD" : "no "}`);
}
console.log(bad ? `\n  ${bad} language(s) wrong` : "\n  all four languages carry the delimiters intact");
