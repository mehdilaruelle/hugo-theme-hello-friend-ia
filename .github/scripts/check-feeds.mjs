// Asserts that every XML output is well-formed.
//
// Nothing in the build parses the XML it writes, so a feed could stop being XML
// and still ship. The way it did: content:encoded wrapped the rendered article
// in a literal CDATA section, and a "]]>" anywhere inside closed that section
// early — the rest of the article became markup, and the whole document stopped
// parsing rather than just the one item.
//
// This is a scanner, not a validator: it checks the things a template can get
// wrong — a "]]>" loose in character data, unbalanced or crossed tags, an
// unterminated section, an ampersand that starts nothing.
//
//   node .github/scripts/check-feeds.mjs <public-dir>

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const NAME = "[A-Za-z_:][-A-Za-z0-9_:.]*";
const ENTITY = new RegExp(`^&(?:#[0-9]+|#[xX][0-9a-fA-F]+|${NAME});`);

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (full.endsWith(".xml")) yield full;
  }
}

// Returns a list of problems; empty means well-formed as far as this checks.
function scan(s) {
  const bad = [];
  const stack = [];
  const at = (i) => {
    const line = s.slice(0, i).split("\n").length;
    return `line ${line}`;
  };
  let i = 0;

  while (i < s.length) {
    const lt = s.indexOf("<", i);
    const text = s.slice(i, lt === -1 ? s.length : lt);

    // Character data. "]]>" must not appear here: it is how a CDATA section
    // ends, so finding one loose means a section ended somewhere it should not.
    const stray = text.indexOf("]]>");
    if (stray !== -1) bad.push(`${at(i + stray)}: "]]>" in character data — a CDATA section closed early`);
    for (let k = text.indexOf("&"); k !== -1; k = text.indexOf("&", k + 1)) {
      if (!ENTITY.test(text.slice(k))) { bad.push(`${at(i + k)}: "&" that starts no entity`); break; }
    }
    if (lt === -1) break;
    i = lt;

    if (s.startsWith("<!--", i)) {
      const end = s.indexOf("-->", i + 4);
      if (end === -1) { bad.push(`${at(i)}: unterminated comment`); break; }
      i = end + 3; continue;
    }
    if (s.startsWith("<![CDATA[", i)) {
      const end = s.indexOf("]]>", i + 9);
      if (end === -1) { bad.push(`${at(i)}: unterminated CDATA section`); break; }
      i = end + 3; continue;
    }
    if (s.startsWith("<?", i)) {
      const end = s.indexOf("?>", i + 2);
      if (end === -1) { bad.push(`${at(i)}: unterminated processing instruction`); break; }
      i = end + 2; continue;
    }
    if (s.startsWith("<!", i)) {           // DOCTYPE and friends
      const end = s.indexOf(">", i + 2);
      if (end === -1) { bad.push(`${at(i)}: unterminated declaration`); break; }
      i = end + 1; continue;
    }

    // A tag. Scan to its ">", skipping any inside a quoted attribute value.
    let j = i + 1, quote = null, end = -1;
    for (; j < s.length; j++) {
      const c = s[j];
      if (quote) { if (c === quote) quote = null; continue; }
      if (c === '"' || c === "'") { quote = c; continue; }
      if (c === ">") { end = j; break; }
    }
    if (end === -1) { bad.push(`${at(i)}: unterminated tag`); break; }

    const raw = s.slice(i + 1, end);
    const closing = raw.startsWith("/");
    const selfClosing = raw.endsWith("/");
    const name = (raw.replace(/^\//, "").match(new RegExp(`^${NAME}`)) || [])[0];
    if (!name) {
      bad.push(`${at(i)}: "<" that starts no tag`);
    } else if (closing) {
      const open = stack.pop();
      if (open === undefined) bad.push(`${at(i)}: </${name}> with nothing open`);
      else if (open.name !== name) bad.push(`${at(i)}: </${name}> closes <${open.name}> opened at ${at(open.i)}`);
    } else if (!selfClosing) {
      stack.push({ name, i });
    }
    i = end + 1;
  }

  for (const open of stack) bad.push(`${at(open.i)}: <${open.name}> is never closed`);
  return bad;
}

const root = process.argv[2] || "public";
const failures = [];
let files = 0;

for (const file of walk(root)) {
  files++;
  const problems = scan(readFileSync(file, "utf8"));
  // One broken item breaks the document, so a handful of lines is enough to act on.
  for (const p of problems.slice(0, 5)) failures.push([file, p]);
}

console.log(`checked ${files} XML files`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n`);
  for (const [file, why] of failures) console.error(`  ${file}\n    ${why}`);
  process.exit(1);
}
console.log("every XML output is well-formed");
