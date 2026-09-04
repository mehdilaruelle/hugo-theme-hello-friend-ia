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
  // Missing rather than empty: readdirSync throws, and a stack trace says less
  // about a wrong working-directory than the line below.
  if (!existsSync(dir)) {
    console.log(`  ${lang.padEnd(3)} BAD  no ${dir} to read`);
    bad++;
    continue;
  }
  const file = readdirSync(dir)
    .map(d => join(dir, d, "index.html"))
    .filter(f => existsSync(f))
    .find(f => readFileSync(f, "utf8").includes("katex"));
  if (!file) {
    console.log(`  ${lang.padEnd(3)} BAD  no page loading KaTeX under ${dir}`);
    bad++;
    continue;
  }
  const s = readFileSync(file, "utf8");
  const inline = s.includes(INLINE);
  const block = s.includes(BLOCK);
  const paragraph = /<p>\$\$/.test(s);
  if (!inline || !block || paragraph) bad++;
  console.log(`  ${lang.padEnd(3)} inline ${inline ? "ok " : "BAD"}   block ${block ? "ok " : "BAD"}   wrapped-in-p ${paragraph ? "BAD" : "no "}`);
}
console.log(bad ? `\n  ${bad} language(s) wrong` : "\n  all four languages carry the delimiters intact");

// Reaching the page is only half of it. The renderer has to be told to look
// for those same delimiters, and '\(' is not an escape sequence: JavaScript
// drops the backslash, leaving a bare parenthesis that never matches. The
// page then shows the TeX as text, with nothing failing anywhere.
const scripts = [];
const findScripts = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) findScripts(f);
    else if (/katex-render(\.min)?\.[0-9a-f]*\.?js$/.test(e.name)) scripts.push(f);
  }
};
findScripts(root);

if (!scripts.length) {
  console.log("\n  BAD  no katex-render script in the build");
  process.exit(1);
}

// In the file the backslash must itself be escaped, so a delimiter of \( is
// written "\\(". Finding a bare "(" instead is the failure this catches.
const wanted = ["(", ")", "[", "]"];
let delims = 0;
for (const f of scripts) {
  const s = readFileSync(f, "utf8");
  const missing = wanted.filter((d) => !s.includes(BS + BS + d));
  if (missing.length) {
    console.log(
      `\n  ${f}: BAD  these delimiters lost their backslash: ` +
        missing.map((d) => BS + d).join(" ")
    );
    delims++;
  }
}
if (!delims) {
  console.log(
    `  the renderer is configured for ${wanted.map((d) => BS + d).join(" ")} as well as $$`
  );
}

process.exit(bad || delims ? 1 : 0);
