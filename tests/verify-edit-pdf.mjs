/**
 * Automated verification for the /edit-pdf editor pipeline.
 *
 * For each generated test PDF (see scripts/make-edit-pdf-test-pdfs.mjs):
 *  1. Extract text blocks (grouping, color, rotation, bold/italic, matching).
 *  2. Apply an in-place edit (+chars outside the subset), whiteout,
 *     highlight annotation, link, shape, draw, image, form field, page ops.
 *  3. Export via exportEditedPdf (pdf-lib + fontkit, bundled TTFs from disk).
 *  4. Re-open output: page count + edited text present.
 *
 * Run: npx tsx tests/verify-edit-pdf.mjs
 * (reads %TEMP%/opencode/edit-pdf-tests, writes *-edited.pdf next to inputs)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import "regenerator-runtime/runtime.js";

const dir = join(tmpdir(), "opencode", "edit-pdf-tests");
const fontDir = join(process.cwd(), "public", "fonts", "edit-pdf");

const pdfjs = await import("pdfjs-dist");
const { extractPageBlocks } = await import("../lib/pdf/edit-pdf/text-extraction");
const { checkGlyphCoverage, matchBundledFontId } = await import("../lib/pdf/edit-pdf/font-matching");
const { exportEditedPdf } = await import("../lib/pdf/edit-pdf/save");
const { PDFDocument } = await import("pdf-lib");

const readPdf = (name) => new Uint8Array(readFileSync(join(dir, name)));
async function openDoc(bytes) {
  const task = pdfjs.getDocument({
    data: bytes.slice(),
    fontExtraProperties: true,
    standardFontDataUrl: new URL("../node_modules/pdfjs-dist/standard_fonts/", import.meta.url).href,
  });
  return task.promise;
}
async function pageText(doc, n) {
  const page = await doc.getPage(n);
  const tc = await page.getTextContent({ includeMarkedContent: false });
  return tc.items.map((i) => i.str ?? "").join(" ");
}
const fontProvider = async (p) => new Uint8Array(readFileSync(join(fontDir, p.split("/").pop())));

const RED_DOT_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

let pass = 0;
let fail = 0;
const results = [];
function check(name, cond, detail = "") {
  if (cond) {
    pass++;
    results.push(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    fail++;
    results.push(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function verifyCase(cfg) {
  console.log(`\n== ${cfg.file} — ${cfg.desc} ==`);
  let bytes;
  try {
    bytes = readPdf(cfg.file);
  } catch (e) {
    check("test pdf exists (run make-edit-pdf-test-pdfs.mjs first)", false, String(e?.message ?? e));
    return;
  }
  let doc;
  try {
    doc = await openDoc(bytes);
  } catch (e) {
    check("opens with pdf.js", false, String(e?.message ?? e).slice(0, 160));
    return;
  }
  check("opens with pdf.js", doc.numPages === cfg.pages, `${doc.numPages} pages`);
  const { blocks, isScanned, width, height, srcRotation } = await extractPageBlocks(pdfjs, doc, cfg.testPage ?? 1);
  const allText = blocks.map((b) => b.text).join("\n");
  if (cfg.scanned) {
    check("flagged as scanned (no editable text)", isScanned === true, `blocks=${blocks.length}`);
  } else {
    check("not scanned", isScanned === false, `${blocks.length} blocks`);
    for (const needle of cfg.expect ?? []) {
      check(`extracts "${needle.slice(0, 34)}"`, allText.includes(needle));
    }
  }
  if (cfg.expectColor) check("non-black fill color detected", blocks.some((b) => b.colorHex.toLowerCase() !== "#000000"), blocks[0]?.colorHex);
  if (cfg.expectBold) check("bold detected", blocks.some((b) => b.bold));
  if (cfg.expectItalic) check("italic detected", blocks.some((b) => b.italic));
  if (cfg.expectRotation !== undefined) {
    check(`rotation ${cfg.expectRotation}° detected`, blocks.some((b) => b.rotation === cfg.expectRotation));
  }
  if (cfg.expectMatch) {
    const got = blocks[0]?.matchedFontId;
    check(`font matched → ${cfg.expectMatch}`, got === cfg.expectMatch, `got ${got} (pdf font "${blocks[0]?.fontName}")`);
  }
  if (cfg.expectScript) {
    check(`${cfg.expectScript} script mapped`, blocks.some((b) => b.matchedFontId === cfg.expectScript));
  }
  if (cfg.expectScript2) {
    check(`${cfg.expectScript2} script mapped`, blocks.some((b) => b.matchedFontId === cfg.expectScript2));
  }
  if (cfg.srcRotation !== undefined) check(`page rotation ${cfg.srcRotation}°`, srcRotation === cfg.srcRotation, `got ${srcRotation}`);
  check("page size sane", width > 100 && height > 100, `${Math.round(width)}x${Math.round(height)}pt`);

  // --- edit + export round-trip (mirrors the UI: embedded subset first,
  // whole-run fallback to the matched bundled font when glyphs are missing) ---
  const edits = [];
  if (blocks.length > 0) {
    const b = blocks[0];
    const editedText = `${b.lines[0] ?? b.text} [EDITED] Ω≈`;
    let fontId = b.hasEmbeddedFont && b.embeddedFamily ? `embedded:${b.embeddedFamily}` : b.matchedFontId;
    if (fontId.startsWith("embedded:") && b.embeddedBytes) {
      const cov = await checkGlyphCoverage(b.embeddedBytes, b.id, editedText);
      check("subset cmap coverage check runs", typeof cov.covered === "boolean", cov.covered ? "all covered" : `missing: ${cov.missing.join("")} → fallback`);
      if (!cov.covered) fontId = b.matchedFontId;
    }
    edits.push({
      id: "edit-t1",
      kind: "edit",
      pageKey: "p0",
      blockId: b.id,
      text: editedText,
      fontId,
      fontSize: b.fontSize,
      colorHex: "#b91c1c",
      bold: b.bold,
      italic: b.italic,
      underline: false,
      align: "left",
      x: b.x,
      y: b.y,
      wrapW: Math.max(40, b.boxW),
      rotation: b.rotation,
      lineHeight: b.lineHeight,
      bgHex: "#ffffff",
      saveFontId: b.matchedFontId,
      fallbackNotice: false,
    });
  }
  const overlays = [
    ...edits,
    { id: "wo-t1", kind: "whiteout", pageKey: "p0", rect: { x: 50, y: 50, w: 120, h: 24 }, colorHex: "#ffffff" },
    { id: "sh-t1", kind: "shape", pageKey: "p0", shape: "rect", rect: { x: 400, y: 700, w: 100, h: 40 }, strokeHex: "#111827", fillHex: null, strokeW: 2 },
    { id: "dr-t1", kind: "draw", pageKey: "p0", points: [{ x: 60, y: 120 }, { x: 120, y: 140 }, { x: 180, y: 120 }], strokeHex: "#047857", strokeW: 2 },
    { id: "im-t1", kind: "image", pageKey: "p0", dataUrl: RED_DOT_PNG, mime: "image/png", rect: { x: 450, y: 60, w: 40, h: 40 } },
    { id: "li-t1", kind: "link", pageKey: "p0", rect: { x: 56, y: 300, w: 200, h: 20 }, url: "https://example.com", destPageKey: null },
    { id: "fm-t1", kind: "form", pageKey: "p0", fieldType: "text", rect: { x: 56, y: 250, w: 200, h: 22 }, name: "VerifyField", value: "hello" },
  ];
  if (blocks.length > 0) {
    const b = blocks[blocks.length - 1];
    overlays.push({
      id: "an-t1",
      kind: "annot",
      pageKey: "p0",
      subtype: "highlight",
      quads: [b.boxX, b.boxY, b.boxX + b.boxW, b.boxY, b.boxX + b.boxW, b.boxY + b.boxH, b.boxX, b.boxY + b.boxH],
      colorHex: "#ffeb00",
    });
  }
  const editorPages = Array.from({ length: cfg.pages }, (_, i) => ({
    key: i === 0 ? "p0" : `p${i}`,
    src: { kind: "orig", index: i },
    rotateDelta: i === 0 ? 90 : 0,
    width,
    height,
    srcRotation,
  }));
  const blockBoxById = new Map(blocks.map((b) => [b.id, { x: b.boxX, y: b.boxY, w: b.boxW, h: b.boxH }]));
  const embeddedBytesByBlock = new Map(blocks.filter((b) => b.embeddedBytes).map((b) => [b.id, b.embeddedBytes]));

  let outBytes = null;
  try {
    outBytes = await exportEditedPdf(
      { originalBytes: bytes, pages: editorPages, overlays, fills: [], blockBoxById, embeddedBytesByBlock, fontBytesProvider: fontProvider },
      () => {}
    );
    check("export succeeds", outBytes.length > 1000, `${(outBytes.length / 1024).toFixed(1)} KB`);
  } catch (e) {
    check("export succeeds", false, String(e?.message ?? e).slice(0, 200));
  }
  if (outBytes) {
    writeFileSync(join(dir, cfg.file.replace(".pdf", "-edited.pdf")), outBytes);
    try {
      const probe = await PDFDocument.load(outBytes.slice());
      check("output page count preserved", probe.getPageCount() === cfg.pages, `${probe.getPageCount()} pages`);
      const outDoc = await openDoc(outBytes);
      const t = await pageText(outDoc, 1);
      check("edited text present in output", edits.length === 0 || t.includes("[EDITED]"));
      await outDoc.destroy();
    } catch (e) {
      check("output re-opens", false, String(e?.message ?? e).slice(0, 160));
    }
  }
  try {
    await doc.destroy();
  } catch {
    /* ignore */
  }
}

const cases = [
  // NOTE (headless): Node has no font loading, so pdf.js reports generic
  // families ("sans-serif"/"serif"); real BaseFont names resolve in browsers.
  // Script detection (Devanagari/Telugu) works from text alone.
  { file: "word.pdf", desc: "Word-style", pages: 1, expect: ["Quarterly Report Q3", "Revenue grew 12 percent"], expectColor: true, expectMatch: "Arimo" },
  { file: "gdocs.pdf", desc: "Google-Docs-style", pages: 1, expect: ["Meeting notes", "Priya to circulate"], expectMatch: "Arimo" },
  { file: "latex.pdf", desc: "LaTeX-style", pages: 1, expect: ["electrodynamics"], expectMatch: "Tinos" },
  { file: "indesign.pdf", desc: "InDesign-style", pages: 1, expect: ["Design Annual 2026", "MARGIN NOTE"], expectColor: true, expectRotation: 90, expectMatch: "Arimo" },
  { file: "scanned.pdf", desc: "Scanned/image-only", pages: 1, scanned: true },
  { file: "rotated.pdf", desc: "Rotated page", pages: 1, srcRotation: 90, expect: ["stored rotated 90 degrees"], expectMatch: "Arimo" },
  { file: "big.pdf", desc: "100-page file", pages: 100, testPage: 50, expect: ["Page 50", "DOC-2026-0050"], expectMatch: "Arimo" },
  { file: "indic.pdf", desc: "Telugu/Hindi", pages: 1, expectScript: "NotoSansDevanagari", expectScript2: "NotoSansTelugu" },
];

for (const c of cases) await verifyCase(c);

// Extra: font-name mapping + glyph-coverage unit checks (no PDF needed).
console.log("\n== font mapping unit checks ==");
check("Arial → Arimo", matchBundledFontId("ABCDEF+ArialMT") === "Arimo");
check("Times → Tinos", matchBundledFontId("TimesNewRomanPSMT") === "Tinos");
check("Courier → Cousine", matchBundledFontId("CourierNewPSMT") === "Cousine");
check("Calibri → Carlito", matchBundledFontId("Calibri-Bold") === "Carlito");
check("Cambria → Caladea", matchBundledFontId("Cambria") === "Caladea");
check("Devanagari text → NotoSansDevanagari", matchBundledFontId("Mangal", "हिंदी") === "NotoSansDevanagari");
check("Telugu text → NotoSansTelugu", matchBundledFontId("Gautami", "తెలుగు") === "NotoSansTelugu");

console.log("\n== glyph coverage unit checks (bundled TTFs incl. variable) ==");
const readFont = (n) => new Uint8Array(readFileSync(join(fontDir, n)));
{
  const arimo = readFont("Arimo-Regular.ttf");
  check("Arimo covers Latin", (await checkGlyphCoverage(arimo, "u-arimo", "Hello 123")).covered);
  const arimoMissing = await checkGlyphCoverage(arimo, "u-arimo", "हिंदी");
  check("Arimo misses Devanagari → fallback engages", !arimoMissing.covered && arimoMissing.missing.length > 0, `missing: ${arimoMissing.missing.slice(0, 4).join("")}`);
  const dev = readFont("NotoSansDevanagari-Variable.ttf");
  check("Noto variable Devanagari covers Hindi", (await checkGlyphCoverage(dev, "u-dev", "यह हिंदी परीक्षण है")).covered);
  const tel = readFont("NotoSansTelugu-Variable.ttf");
  check("Noto variable Telugu covers Telugu", (await checkGlyphCoverage(tel, "u-tel", "ఇది తెలుగు పరీక్ష")).covered);
  const tino = readFont("Tinos-Bold.ttf");
  check("Tinos-Bold loads via fontkit", (await checkGlyphCoverage(tino, "u-tino", "Bold")).covered);
}

console.log(`\n${results.join("\n")}\n\nTOTAL: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
