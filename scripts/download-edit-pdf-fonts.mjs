/**
 * Downloads bundled font files for the /edit-pdf editor.
 *
 * Sources (all OFL-1.1 or Apache-2.0):
 *  - Croscore Arimo / Tinos / Cousine (metric-compatible with Arial-Helvetica,
 *    Times New Roman, Courier New; Apache-2.0) — static TTFs from google/fonts
 *    history (pinned commits, before variable-font conversion).
 *  - Carlito / Caladea (metric-compatible with Calibri / Cambria; OFL-1.1)
 *    — static TTFs from google/fonts @ main.
 *  - Noto Sans / Noto Serif / Noto Sans Devanagari / Noto Sans Telugu
 *    (OFL-1.1) — variable TTFs from google/fonts @ main (default instance
 *    used for embedding; covers Latin + Hindi + Telugu scripts).
 *  - OFL-1.1 and Apache-2.0 license texts.
 *
 * Run: node scripts/download-edit-pdf-fonts.mjs
 */
import { mkdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "fonts", "edit-pdf");
mkdirSync(outDir, { recursive: true });

const GF_RAW = "https://github.com/google/fonts/raw";

const FILES = [
  // [sourceUrl, destFile]
  // Arimo (Apache-2.0) @ 2020 commit with static TTFs
  ...["Regular", "Bold", "Italic", "BoldItalic"].map((w) => [
    `${GF_RAW}/7252eca1fac7ed118f81c4ba5d520f6f40c22860/apache/arimo/Arimo-${w}.ttf`,
    `Arimo-${w}.ttf`,
  ]),
  // Tinos (Apache-2.0)
  ...["Regular", "Bold", "Italic", "BoldItalic"].map((w) => [
    `${GF_RAW}/8f9756108bfbbdf625e24e6b869ed02465b2a7af/apache/tinos/Tinos-${w}.ttf`,
    `Tinos-${w}.ttf`,
  ]),
  // Cousine (Apache-2.0)
  ...["Regular", "Bold", "Italic", "BoldItalic"].map((w) => [
    `${GF_RAW}/b8df7813875fe214d7980c4ba03094077b859f8e/apache/cousine/Cousine-${w}.ttf`,
    `Cousine-${w}.ttf`,
  ]),
  // Carlito / Caladea (OFL) @ main
  ...["Regular", "Italic", "Bold", "BoldItalic"].map((w) => [
    `${GF_RAW}/main/ofl/carlito/Carlito-${w}.ttf`,
    `Carlito-${w}.ttf`,
  ]),
  ...["Regular", "Italic", "Bold", "BoldItalic"].map((w) => [
    `${GF_RAW}/main/ofl/caladea/Caladea-${w}.ttf`,
    `Caladea-${w}.ttf`,
  ]),
  // Noto variable fonts (OFL) @ main
  [`${GF_RAW}/main/ofl/notosans/NotoSans%5Bwdth%2Cwght%5D.ttf`, "NotoSans-Variable.ttf"],
  [`${GF_RAW}/main/ofl/notoserif/NotoSerif%5Bwdth%2Cwght%5D.ttf`, "NotoSerif-Variable.ttf"],
  [`${GF_RAW}/main/ofl/notosansdevanagari/NotoSansDevanagari%5Bwdth%2Cwght%5D.ttf`, "NotoSansDevanagari-Variable.ttf"],
  [`${GF_RAW}/main/ofl/notosanstelugu/NotoSansTelugu%5Bwdth%2Cwght%5D.ttf`, "NotoSansTelugu-Variable.ttf"],
  // License texts
  [`${GF_RAW}/main/ofl/carlito/OFL.txt`, "OFL.txt"],
  ["https://www.apache.org/licenses/LICENSE-2.0.txt", "Apache-2.0.txt"],
];

let ok = 0;
let skipped = 0;
let failed = 0;

for (const [src, dest] of FILES) {
  const destPath = join(outDir, dest);
  if (existsSync(destPath) && statSync(destPath).size > 1000) {
    console.log(`skip (exists) ${dest}`);
    skipped++;
    continue;
  }
  try {
    const r = await fetch(src, { redirect: "follow" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1000) throw new Error(`suspiciously small (${buf.length} bytes)`);
    // Sanity: TTFs must start with 00 01 00 00, 'true', 'OTTO', or 'wOF?' (variable TTF starts 00 01 00 00)
    if (dest.endsWith(".ttf")) {
      const magic = buf.subarray(0, 4);
      const isFont =
        (magic[0] === 0x00 && magic[1] === 0x01 && magic[2] === 0x00 && magic[3] === 0x00) ||
        magic.toString("ascii", 0, 4) === "true" ||
        magic.toString("ascii", 0, 4) === "OTTO" ||
        magic.toString("ascii", 0, 4) === "ttcf";
      if (!isFont) throw new Error(`not a font file (magic=${magic.toString("hex")}, ${buf.length} bytes)`);
    }
    writeFileSync(destPath, buf);
    console.log(`saved ${dest} (${(buf.length / 1024).toFixed(0)} KB)`);
    ok++;
  } catch (e) {
    console.error(`!! ${dest}: ${e.message} (from ${src})`);
    failed++;
  }
}

console.log(`\nDone: ${ok} downloaded, ${skipped} skipped, ${failed} failed -> ${outDir}`);
process.exit(failed > 0 ? 1 : 0);
