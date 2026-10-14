/**
 * Generates 8 test PDFs for the /edit-pdf editor covering the required matrix:
 * Word-exported, Google-Docs-exported, LaTeX, InDesign, scanned, rotated page,
 * 100-page file, Telugu/Hindi text.
 *
 * Output: %TEMP%/opencode/edit-pdf-tests/*.pdf (never written into the repo).
 * Run: node scripts/make-edit-pdf-test-pdfs.mjs
 */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import "regenerator-runtime/runtime.js";
import fontkit from "@pdf-lib/fontkit";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(tmpdir(), "opencode", "edit-pdf-tests");
mkdirSync(outDir, { recursive: true });

const fontDir = join(root, "public", "fonts", "edit-pdf");
const readFont = (name) => readFileSync(join(fontDir, name));

async function wordLike() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvB = await doc.embedFont(StandardFonts.HelveticaBold);
  page.drawText("Quarterly Report Q3", { x: 56, y: 780, size: 20, font: helvB, color: rgb(0.12, 0.23, 0.54) });
  const body = [
    "Revenue grew 12 percent compared to the previous quarter.",
    "Operating costs remained flat at 4.2 million dollars.",
    "The board approved the expansion plan for 2026 yesterday.",
  ];
  let y = 740;
  for (const line of body) {
    page.drawText(line, { x: 56, y, size: 11, font: helv, color: rgb(0, 0, 0) });
    y -= 18;
  }
  return doc.save();
}

async function docsLike() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvI = await doc.embedFont(StandardFonts.HelveticaOblique);
  page.drawText("Meeting notes - October", { x: 72, y: 720, size: 16, font: helv, color: rgb(0.29, 0.29, 0.29) });
  page.drawText("Attendees approved the draft after minor edits.", { x: 72, y: 690, size: 11, font: helvI, color: rgb(0.2, 0.2, 0.2) });
  page.drawText("Action item: Priya to circulate the final PDF.", { x: 72, y: 668, size: 11, font: helv, color: rgb(0, 0, 0) });
  return doc.save();
}

async function latexLike() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const times = await doc.embedFont(StandardFonts.TimesRoman);
  const timesB = await doc.embedFont(StandardFonts.TimesRomanBold);
  const timesI = await doc.embedFont(StandardFonts.TimesRomanItalic);
  page.drawText("On the electrodynamics of moving bodies", { x: 120, y: 780, size: 14, font: timesB, color: rgb(0, 0, 0) });
  page.drawText("It is known that Maxwell's electrodynamics leads to asymmetries.", { x: 72, y: 748, size: 10, font: times, color: rgb(0, 0, 0) });
  page.drawText("These asymmetries do not appear to be inherent in the phenomena.", { x: 72, y: 732, size: 10, font: timesI, color: rgb(0, 0, 0) });
  return doc.save();
}

async function indesignLike() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  doc.registerFontkit(fontkit);
  const carlito = await doc.embedFont(readFont("Carlito-Regular.ttf"), { subset: true });
  const caladeaB = await doc.embedFont(readFont("Caladea-Bold.ttf"), { subset: true });
  page.drawText("Design Annual 2026", { x: 56, y: 760, size: 28, font: caladeaB, color: rgb(0.55, 0.08, 0.10) });
  page.drawText("A showcase of editorial layouts from twelve studios.", { x: 56, y: 730, size: 12, font: carlito, color: rgb(0, 0, 0) });
  page.drawText("MARGIN NOTE", { x: 520, y: 400, size: 9, font: carlito, color: rgb(0.4, 0.4, 0.4), rotate: degrees(90) });
  return doc.save();
}

async function scannedLike() {
  // Image-only page (vector shapes, zero text) — exercises the scanned branch.
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  page.drawRectangle({ x: 56, y: 600, width: 483, height: 140, borderColor: rgb(0, 0, 0), borderWidth: 1 });
  for (let i = 0; i < 6; i++) {
    page.drawRectangle({ x: 66, y: 700 - i * 20, width: 463 - i * 37, height: 8, color: rgb(0.75, 0.75, 0.75), borderWidth: 0 });
  }
  page.drawLine({ start: { x: 56, y: 560 }, end: { x: 539, y: 560 }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) });
  return doc.save();
}

async function rotatedLike() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText("This page is stored rotated 90 degrees.", { x: 56, y: 700, size: 12, font: helv, color: rgb(0, 0, 0) });
  page.drawText("Second line of rotated content.", { x: 56, y: 680, size: 12, font: helv, color: rgb(0, 0, 0) });
  page.setRotation(degrees(90));
  return doc.save();
}

async function bigLike() {
  const doc = await PDFDocument.create();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= 100; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(`Page ${i} - The quick brown fox jumps over the lazy dog.`, { x: 56, y: 780, size: 11, font: helv, color: rgb(0, 0, 0) });
    page.drawText(`Reference number DOC-2026-${String(i).padStart(4, "0")}`, { x: 56, y: 760, size: 10, font: helv, color: rgb(0.3, 0.3, 0.3) });
  }
  return doc.save();
}

async function indicLike() {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const dev = await doc.embedFont(readFont("NotoSansDevanagari-Variable.ttf"), { subset: true });
  const tel = await doc.embedFont(readFont("NotoSansTelugu-Variable.ttf"), { subset: true });
  const page = doc.addPage([595, 842]);
  page.drawText("यह एक हिंदी परीक्षण वाक्य है।", { x: 56, y: 760, size: 16, font: dev, color: rgb(0, 0, 0) });
  page.drawText("ఇది తెలుగు పరీక్ష వాక్యం.", { x: 56, y: 720, size: 16, font: tel, color: rgb(0, 0, 0) });
  page.drawText("Mixed: Hello नमस्ते ", { x: 56, y: 680, size: 14, font: dev, color: rgb(0.1, 0.1, 0.4) });
  page.drawText("హలో", { x: 235, y: 680, size: 14, font: tel, color: rgb(0.1, 0.1, 0.4) });
  page.drawText(" 123", { x: 275, y: 680, size: 14, font: dev, color: rgb(0.1, 0.1, 0.4) });
  return doc.save();
}

const jobs = [
  ["word.pdf", wordLike, "Word-style (Helvetica, colored heading)"],
  ["gdocs.pdf", docsLike, "Google-Docs-style (Helvetica + oblique, gray)"],
  ["latex.pdf", latexLike, "LaTeX-style (Times + bold/italic)"],
  ["indesign.pdf", indesignLike, "InDesign-style (Carlito/Caladea subset, rotated label)"],
  ["scanned.pdf", scannedLike, "Scanned/image-only (no text)"],
  ["rotated.pdf", rotatedLike, "Rotated page (/Rotate 90)"],
  ["big.pdf", bigLike, "100-page file"],
  ["indic.pdf", indicLike, "Telugu/Hindi (Noto variable subsets)"],
];

for (const [file, fn, desc] of jobs) {
  const bytes = await fn();
  writeFileSync(join(outDir, file), bytes);
  console.log(`saved ${file} (${(bytes.length / 1024).toFixed(1)} KB) — ${desc}`);
}
console.log(`\nAll test PDFs in: ${outDir}`);
