import fs from 'node:fs'
import zlib from 'node:zlib'

// WOFF 1.0: a header, then a table directory whose entries are each either
// stored or zlib-deflated. Enough to read head and OS/2, which is all the
// metrics overrides need.
const buf = fs.readFileSync(process.argv[2])
if (buf.toString('ascii', 0, 4) !== 'wOFF') throw new Error('not a WOFF file')

const numTables = buf.readUInt16BE(12)
const tables = {}
for (let i = 0; i < numTables; i++) {
  const o = 44 + i * 20
  const tag = buf.toString('ascii', o, o + 4)
  const offset = buf.readUInt32BE(o + 4)
  const compLength = buf.readUInt32BE(o + 8)
  const origLength = buf.readUInt32BE(o + 12)
  const raw = buf.subarray(offset, offset + compLength)
  tables[tag] = compLength === origLength ? raw : zlib.inflateSync(raw)
}

const head = tables['head']
const os2 = tables['OS/2']
if (!head || !os2) throw new Error('head or OS/2 missing')

const unitsPerEm = head.readUInt16BE(18)
const typoAscender = os2.readInt16BE(68)
const typoDescender = os2.readInt16BE(70)
const typoLineGap = os2.readInt16BE(72)
const winAscent = os2.readUInt16BE(74)
const winDescent = os2.readUInt16BE(76)

const pct = (v) => `${(Math.abs(v) / unitsPerEm * 100).toFixed(2)}%`

console.log(JSON.stringify({
  file: process.argv[2].split(/[\\/]/).pop(),
  unitsPerEm,
  typoAscender, typoDescender, typoLineGap,
  winAscent, winDescent,
  // Chrome derives the used metrics from the OS/2 win values for most fonts,
  // which is what the overrides have to match.
  ascentOverride: pct(winAscent),
  descentOverride: pct(winDescent),
  lineGapOverride: pct(typoLineGap),
}, null, 2))
