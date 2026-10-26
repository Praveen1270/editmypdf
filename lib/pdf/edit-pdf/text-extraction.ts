/**
 * Text extraction + line/block grouping for the /edit-pdf editor.
 *
 * - Uses pdf.js `getTextContent({ includeMarkedContent: false })`.
 * - Groups items into lines by baseline y / font / size / x-gap, then merges
 *   lines into blocks (paragraph split by line spacing).
 * - Reads fill color from the page operator list
 *   (setFillRGBColor / setFillGray / setFillCMYKColor / setFillColorSpace+Color).
 * - Harvests embedded font bytes from `page.commonObjs` (loaded with
 *   `fontExtraProperties: true`) and registers them via the FontFace API so
 *   the inline editor renders with the REAL embedded font.
 */
import {
  TextBlock,
  PdfExistingImage,
  newOverlayId,
} from "./types";
import {
  matchBundledFontId,
  detectBoldFromName,
  detectItalicFromName,
  stripSubsetPrefix,
  looksLikeEmbeddableFont,
  registerEmbeddedFontFace,
} from "./font-matching";

/* ---------------- color helpers (shared with save.ts) ---------------- */

export function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  let clean = (hex || "").replace("#", "").trim();
  if (clean.length === 3) clean = clean.split("").map((c) => c + c).join("");
  const int = parseInt(clean, 16);
  if (Number.isNaN(int) || clean.length !== 6) return { r: 0, g: 0, b: 0 };
  return {
    r: ((int >> 16) & 255) / 255,
    g: ((int >> 8) & 255) / 255,
    b: (int & 255) / 255,
  };
}

export function rgb01ToHex(r: number, g: number, b: number): string {
  const q = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v * 255)))
      .toString(16)
      .padStart(2, "0");
  return `#${q(r)}${q(g)}${q(b)}`;
}

/* ---------------- operator-list color tracking ---------------- */

interface RunColor {
  hex: string;
}

/**
 * Walk the pdf.js operator list and return the active fill color for each
 * text-showing run, in content-stream order.
 *
 * NOTE: pdf.js normalizes EVERY fill-color op (g/G, rg/RG, k/K, scn/SCN) to
 * `setFillRGBColor` whose args are 0–255 bytes (see the worker's color
 * normalization switch), so a single branch covers gray/RGB/CMYK/patterns.
 * In pdf.js v4 `showText` args are pre-parsed glyph arrays (not raw strings),
 * so every text-showing op counts as ONE run, except TJ arrays
 * (`showTextArray`) whose raw form still lists each string operand.
 */
export function colorsForTextRuns(pdfjs: any, opList: any): RunColor[] {
  const out: RunColor[] = [];
  if (!opList || !pdfjs?.OPS) return out;
  const OPS = pdfjs.OPS;
  const fnArray: number[] = opList.fnArray ?? [];
  const argsArray: any[][] = opList.argsArray ?? [];
  let cur = "#000000";

  const push = (n: number) => {
    for (let i = 0; i < n; i++) out.push({ hex: cur });
  };

  for (let i = 0; i < fnArray.length; i++) {
    const fn = fnArray[i];
    const args = argsArray[i] ?? [];
    if (fn === OPS.setFillRGBColor && args.length >= 3) {
      // Normalized 0–255 bytes (NOT 0–1 floats).
      cur = rgb01ToHex(+args[0] / 255, +args[1] / 255, +args[2] / 255);
    } else if (fn === OPS.showText) {
      push(1);
    } else if (fn === OPS.nextLineShowText || fn === OPS.nextLineSetSpacingShowText) {
      push(1);
    } else if (fn === OPS.showTextArray) {
      const arr = args[0];
      if (Array.isArray(arr)) {
        const strings = arr.filter((el) => typeof el === "string").length;
        push(strings > 0 ? strings : 1);
      } else {
        push(1);
      }
    }
  }
  return out;
}

/* ---------------- existing image extraction ---------------- */

export function extractImagesFromOpList(
  pdfjs: any,
  opList: any,
  pageIndex: number,
  pageWidth: number,
  pageHeight: number
): PdfExistingImage[] {
  const images: PdfExistingImage[] = [];
  if (!opList || !pdfjs?.OPS) return images;

  const OPS = pdfjs.OPS;
  const fnArray: number[] = opList.fnArray ?? [];
  const argsArray: any[][] = opList.argsArray ?? [];

  let matrix = [1, 0, 0, 1, 0, 0];
  const stack: number[][] = [];

  const mult = (m1: number[], m2: number[]): number[] => {
    return [
      m1[0] * m2[0] + m1[1] * m2[2],
      m1[0] * m2[1] + m1[1] * m2[3],
      m1[2] * m2[0] + m1[3] * m2[2],
      m1[2] * m2[1] + m1[3] * m2[3],
      m1[4] * m2[0] + m1[5] * m2[2] + m2[4],
      m1[4] * m2[1] + m1[5] * m2[3] + m2[5],
    ];
  };

  let imgCount = 0;

  for (let i = 0; i < fnArray.length; i++) {
    const fn = fnArray[i];
    const args = argsArray[i] ?? [];

    if (fn === OPS.save) {
      stack.push([...matrix]);
    } else if (fn === OPS.restore) {
      matrix = stack.pop() || [1, 0, 0, 1, 0, 0];
    } else if (fn === OPS.transform && args.length >= 6) {
      matrix = mult(matrix, [
        Number(args[0]) || 0,
        Number(args[1]) || 0,
        Number(args[2]) || 0,
        Number(args[3]) || 0,
        Number(args[4]) || 0,
        Number(args[5]) || 0,
      ]);
    } else if (
      fn === OPS.paintImageXObject ||
      fn === OPS.paintInlineImageXObject ||
      fn === OPS.paintImageMaskXObject
    ) {
      const a = matrix[0];
      const b = matrix[1];
      const c = matrix[2];
      const d = matrix[3];
      const e = matrix[4];
      const f = matrix[5];

      // Corners of unit square (0,0) to (1,1) in PDF user space:
      const p0x = e;
      const p0y = f;
      const p1x = a + e;
      const p1y = b + f;
      const p2x = a + c + e;
      const p2y = b + d + f;
      const p3x = c + e;
      const p3y = d + f;

      const minX = Math.min(p0x, p1x, p2x, p3x);
      const maxX = Math.max(p0x, p1x, p2x, p3x);
      const minY = Math.min(p0y, p1y, p2y, p3y);
      const maxY = Math.max(p0y, p1y, p2y, p3y);

      const w = Math.round((maxX - minX) * 10) / 10;
      const h = Math.round((maxY - minY) * 10) / 10;

      // Filter out tiny artifacts, pattern tiles, or page-sized full background rects
      if (w >= 14 && h >= 14 && !(w >= pageWidth - 4 && h >= pageHeight - 4)) {
        imgCount++;
        images.push({
          id: `orig-img-p${pageIndex}-${imgCount}`,
          pageIndex,
          rect: {
            x: Math.round(minX * 10) / 10,
            y: Math.round(minY * 10) / 10,
            w,
            h,
          },
          name: typeof args[0] === "string" ? args[0] : undefined,
        });
      }
    }
  }

  return images;
}

/* ---------------- embedded font harvesting ---------------- */

export interface HarvestedFont {
  family: string;
  bytes: Uint8Array;
  registered: boolean;
}

const harvestCache = new Map<string, HarvestedFont>();

function sanitizeFamily(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "EmbFont";
}

/**
 * Try to read the embedded font program for `fontKey` (the pdf.js loadedName,
 * e.g. "g_d0_f2") from the PAGE's common objects. Returns null for
 * standard-14 / Type1 / CFF fonts (which cannot be re-embedded by
 * pdf-lib/fontkit), for fonts not (yet) resolved, or when bytes are missing.
 *
 * NOTE: fonts resolve into `page.commonObjs` when the page is rendered (or
 * its text layer built), so callers should (re-)try after first render.
 */
export async function harvestEmbeddedFont(
  page: any,
  pageNumber: number,
  fontKey: string
): Promise<HarvestedFont | null> {
  const cacheKey = `${pageNumber}::${fontKey}`;
  const cached = harvestCache.get(cacheKey);
  if (cached) return cached;
  try {
    const commonObjs = page?.commonObjs;
    if (!commonObjs || typeof commonObjs.get !== "function") return null;
    let fontObj: any = null;
    try {
      fontObj = commonObjs.get(fontKey);
    } catch {
      return null; // "not resolved yet" — caller retries after render
    }
    if (!fontObj) return null;
    // Main-thread FontFaceObject carries the raw font file in `.data`.
    const data = fontObj.data ?? null;
    if (!data) return null;
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    if (bytes.length < 100 || bytes.length > 8 * 1024 * 1024) return null;
    if (!looksLikeEmbeddableFont(bytes)) return null;
    const family = `EditPdfEmb-${pageNumber}-${sanitizeFamily(stripSubsetPrefix(fontKey))}`;
    const copy = new Uint8Array(bytes.length);
    copy.set(bytes);
    const registered = await registerEmbeddedFontFace(family, copy);
    const result: HarvestedFont = { family, bytes: copy, registered };
    harvestCache.set(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

/* ---------------- main extraction ---------------- */

export interface PageBlocksResult {
  blocks: TextBlock[];
  existingImages: PdfExistingImage[];
  /** Unrotated user-space size (PDF points). */
  width: number;
  height: number;
  srcRotation: number;
  isScanned: boolean;
  rawItemCount: number;
  rawCharCount: number;
}

interface RawRun {
  str: string;
  x: number;
  y: number;
  fontSize: number;
  /** pdf.js loadedName (e.g. "g_d0_f2") — key for page.commonObjs. */
  fontKey: string;
  /** Human-readable family from textContent.styles (e.g. "Helvetica-Bold"). */
  fontName: string;
  fontFamily: string;
  ascent: number; // em fraction
  descent: number; // em fraction (positive number)
  colorHex: string;
  rotation: number;
  width: number;
  bold: boolean;
  italic: boolean;
  embeddedFamily?: string;
  embeddedBytes?: Uint8Array;
  hasEmbeddedFont: boolean;
}

function quantizeRotation(deg: number): number {
  const n = ((deg % 360) + 360) % 360;
  const snaps = [0, 90, 180, 270, 360];
  for (const s of snaps) {
    if (Math.abs(n - s) <= 2) return s % 360;
  }
  return Math.round(n * 10) / 10;
}

/**
 * Extract editable text blocks for a 1-indexed page of an open pdf.js document.
 * `pdfDoc` must have been opened with `{ fontExtraProperties: true }`.
 */
export async function extractPageBlocks(
  pdfjs: any,
  pdfDoc: any,
  pageNumber: number
): Promise<PageBlocksResult> {
  const page = await pdfDoc.getPage(pageNumber);
  try {
    const viewport = page.getViewport({ scale: 1 });
    // Unrotated user-space size (pdf.js `view` is pre-rotation).
    const view: number[] = Array.isArray(page.view) && page.view.length === 4 ? page.view : [0, 0, viewport.width, viewport.height];
    const width = Math.abs(view[2] - view[0]);
    const height = Math.abs(view[3] - view[1]);
    const srcRotation = ((page.rotate ?? 0) % 360 + 360) % 360;

    const textContent = await page.getTextContent({ includeMarkedContent: false });
    let opColors: RunColor[] = [];
    let existingImages: PdfExistingImage[] = [];
    try {
      const opList = await page.getOperatorList();
      opColors = colorsForTextRuns(pdfjs, opList);
      existingImages = extractImagesFromOpList(pdfjs, opList, pageNumber - 1, width, height);
    } catch {
      opColors = [];
      existingImages = [];
    }

    const styles: Record<string, any> = (textContent as any).styles ?? {};
    const rawRuns: RawRun[] = [];
    let rawCharCount = 0;

    const items: any[] = (textContent as any).items ?? [];
    for (const item of items) {
      const str: string = item.str ?? "";
      if (!str || str.length === 0) continue;

      // Handle pure whitespace items (spaces emitted between words by pdf.js)
      if (str.trim().length === 0) {
        if (rawRuns.length > 0) {
          const lastRun = rawRuns[rawRuns.length - 1];
          if (!lastRun.str.endsWith(" ")) {
            lastRun.str += " ";
            const w = typeof item.width === "number" && item.width > 0 ? item.width : lastRun.fontSize * 0.25;
            lastRun.width += w;
          }
        }
        continue;
      }

      rawCharCount += str.length;
      const t: number[] = item.transform ?? [1, 0, 0, 1, 0, 0];
      const [a, b, c, d, e, f] = t;
      const sizeA = Math.hypot(a, b);
      const sizeD = Math.hypot(c, d);
      const fontSize = Math.max(sizeA, sizeD, 1);
      const rotation = quantizeRotation((Math.atan2(b, a) * 180) / Math.PI);
      // IMPORTANT: item.fontName is pdf.js's internal loadedName ("g_d0_f2").
      // The real family ("Helvetica-Bold", "ABCDEF+Calibri", …) lives in
      // textContent.styles[fontKey].fontFamily once the font has loaded
      // (generic "sans-serif"/"serif"/"monospace" while it hasn't).
      const fontKey: string = item.fontName ?? "Helvetica";
      const styleObj = styles[fontKey] ?? {};
      const effectiveName: string = styleObj.fontFamily || fontKey;
      const fontFamily: string = effectiveName;
      const ascent = typeof styleObj.ascent === "number" ? styleObj.ascent : 0.8;
      const descent = typeof styleObj.descent === "number" ? Math.abs(styleObj.descent) : 0.25;
      const w = typeof item.width === "number" && item.width > 0 ? item.width : fontSize * 0.5 * str.length;

      rawRuns.push({
        str,
        x: e,
        y: f,
        fontSize: Math.round(fontSize * 10) / 10,
        fontKey,
        fontName: effectiveName,
        fontFamily,
        ascent,
        descent,
        colorHex: "#000000", // assigned below (order-matched to op colors)
        rotation,
        width: w,
        bold: false, // resolved after harvest (descriptor flags)
        italic: false,
        hasEmbeddedFont: false,
      });
    }

    // Assign operator-list colors to runs by content order. In the common
    // case (one Tj/TJ per text item) counts match 1:1; otherwise resample
    // proportionally so a count mismatch can never misalign everything.
    for (let i = 0; i < rawRuns.length; i++) {
      if (opColors.length === 0) break;
      if (opColors.length === rawRuns.length) {
        rawRuns[i].colorHex = opColors[i].hex;
      } else {
        const j = Math.min(opColors.length - 1, Math.floor((i * opColors.length) / rawRuns.length));
        rawRuns[i].colorHex = opColors[j].hex;
      }
    }

    // Resolve bold/italic + embedded fonts per distinct font key (cached).
    const fontMeta = new Map<string, { bold: boolean; italic: boolean; harvested: HarvestedFont | null }>();
    for (const run of rawRuns) {
      let meta = fontMeta.get(run.fontKey);
      if (!meta) {
        const combined = `${run.fontName} ${run.fontFamily}`;
        let bold = detectBoldFromName(combined);
        let italic = detectItalicFromName(combined);
        let harvested: HarvestedFont | null = null;
        try {
          harvested = await harvestEmbeddedFont(page, pageNumber, run.fontKey);
        } catch {
          harvested = null;
        }
        // pdf.js font descriptor flags (more reliable than name parsing).
        try {
          const fobj = page?.commonObjs?.get?.(run.fontKey);
          if (fobj) {
            if (typeof fobj.bold === "boolean") bold = bold || fobj.bold;
            if (typeof fobj.italic === "boolean") italic = italic || fobj.italic;
            if (typeof fobj.black === "boolean" && fobj.black) bold = true;
            if (fobj.name && typeof fobj.name === "string") {
              run.fontName = fobj.name;
              run.fontFamily = fobj.name;
            }
          }
        } catch {
          /* font not resolved yet — retry after render */
        }
        meta = { bold, italic, harvested };
        fontMeta.set(run.fontKey, meta);
      }
      run.bold = meta.bold;
      run.italic = meta.italic;
      if (meta.harvested) {
        run.hasEmbeddedFont = meta.harvested.registered;
        run.embeddedFamily = meta.harvested.family;
        run.embeddedBytes = meta.harvested.bytes;
      }
    }

    const blocks = groupRunsIntoBlocks(rawRuns, pageNumber - 1);
    const isScanned = rawCharCount < 10 || blocks.length === 0;
    return { blocks, existingImages, width, height, srcRotation, isScanned, rawItemCount: items.length, rawCharCount };
  } finally {
    try {
      await (page as any).cleanup?.();
    } catch {
      /* ignore */
    }
  }
}

function fontKeyOf(r: RawRun): string {
  const sizeBucket = Math.round(r.fontSize * 2) / 2;
  return `${r.fontName}|${sizeBucket}|${r.rotation}|${r.colorHex}`;
}

/** Local bbox corners of a run (rotated), then unioned axis-aligned. */
function runCorners(r: RawRun): { minX: number; minY: number; maxX: number; maxY: number } {
  const asc = r.ascent * r.fontSize;
  const desc = r.descent * r.fontSize;
  const rad = (r.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  // Local rect: (0,-desc) -> (w, asc), rotated about baseline origin (x, y).
  const pts = [
    [0, -desc],
    [r.width, -desc],
    [r.width, asc],
    [0, asc],
  ].map(([lx, ly]) => ({ x: r.x + lx * cos - ly * sin, y: r.y + lx * sin + ly * cos }));
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

interface GroupedLine {
  runs: RawRun[];
  text: string;
  x: number;
  y: number;
  endX: number;
  fontSize: number;
  key: string;
}

function groupRunsIntoBlocks(runs: RawRun[], srcPageIndex: number): TextBlock[] {
  if (runs.length === 0) return [];
  // Sort: rotation bucket, then baseline (desc for horizontal), then x.
  const sorted = [...runs].sort((p, q) => {
    if (p.rotation !== q.rotation) return p.rotation - q.rotation;
    const horiz = p.rotation === 0 || p.rotation === 180;
    if (horiz) {
      const dy = q.y - p.y;
      if (Math.abs(dy) > 0.5) return dy;
      return p.x - q.x;
    }
    const dx = p.x - q.x;
    if (Math.abs(dx) > 0.5) return dx;
    return p.y - q.y;
  });

  // 1. Group into lines (line by line).
  const lines: GroupedLine[] = [];
  for (const r of sorted) {
    const key = fontKeyOf(r);
    const last = lines[lines.length - 1];
    const sameRotation = Boolean(last && last.runs[0].rotation === r.rotation);
    const sameBaseline = Boolean(last && Math.abs(r.y - last.y) <= 1.2);
    const sameFontSize = Boolean(last && Math.abs(r.fontSize - last.fontSize) <= 1.0);
    const gap = last ? r.x - last.endX : 0;
    // Word spacing in PDF typography is typically 0.2 to 0.3 em.
    // If gap is negative (out of order / separate box) or greater than 0.45 em (max 5pt),
    // it belongs to a separate box, column, or table cell!
    const isAdjacentWord = Boolean(
      last &&
      gap >= -0.5 &&
      gap <= Math.max(1.5, Math.min(r.fontSize * 0.45, 5))
    );

    const sameLine = sameRotation && sameBaseline && sameFontSize && isAdjacentWord;
    if (sameLine) {
      const gap = r.x - last.endX;
      // In typography and PDF extraction, word spaces range from 0.12 to 0.35 * fontSize.
      // If neither token already has whitespace and there is a noticeable gap between words,
      // preserve the word space so words like "New Power Converter" are never concatenated.
      const hasSpace = last.text.endsWith(" ") || r.str.startsWith(" ");
      const isWordSpace =
        !hasSpace &&
        (gap >= Math.min(1.5, r.fontSize * 0.12) ||
          (gap > 0.8 && r.str.length > 1 && last.text.length > 1));
      const sep = isWordSpace ? " " : "";
      last.runs.push(r);
      last.text += sep + r.str;
      last.endX = Math.max(last.endX, r.x + r.width);
      if (r.fontSize > last.fontSize || (r.bold && !last.runs[0].bold)) {
        last.fontSize = Math.max(last.fontSize, r.fontSize);
      }
    } else {
      lines.push({ runs: [r], text: r.str, x: r.x, y: r.y, endX: r.x + r.width, fontSize: r.fontSize, key });
    }
  }

  // 2. Line by line selection: each line is an independent selectable and editable block!
  return lines.map((line, idx) => buildBlock([line], srcPageIndex, idx));
}

function buildBlock(lines: GroupedLine[], srcPageIndex: number, index: number): TextBlock {
  const first = lines[0].runs[0];
  const text = lines.map((l) => l.text).join("\n");
  const lineBaselines = lines.map((l) => ({ x: l.x, y: l.y }));
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const line of lines) {
    for (const r of line.runs) {
      const c = runCorners(r);
      minX = Math.min(minX, c.minX);
      minY = Math.min(minY, c.minY);
      maxX = Math.max(maxX, c.maxX);
      maxY = Math.max(maxY, c.maxY);
    }
  }
  // Median line height.
  const gaps: number[] = [];
  for (let i = 1; i < lines.length; i++) gaps.push(Math.abs(lines[i].y - lines[i - 1].y));
  gaps.sort((a, b) => a - b);
  const lineHeight = gaps.length > 0 ? gaps[Math.floor(gaps.length / 2)] : first.fontSize * 1.2;

  const totalChars = Math.max(1, text.replace(/\n/g, "").length);
  const approxWidth = maxX - minX;
  const perChar = approxWidth / totalChars;
  const charWidths = text.split("").map((ch) => (ch === "\n" ? 0 : perChar));

  return {
    id: `b${srcPageIndex}-${index}-${newOverlayId("blk").slice(-6)}`,
    srcPageIndex,
    text,
    x: lines[0].x,
    y: lines[0].y,
    boxX: minX,
    boxY: minY,
    boxW: Math.max(1, maxX - minX),
    boxH: Math.max(1, maxY - minY),
    fontName: first.fontName,
    fontFamily: first.fontFamily,
    fontKey: first.fontKey,
    fontSize: first.fontSize,
    colorHex: first.colorHex,
    rotation: first.rotation,
    bold: first.bold,
    italic: first.italic,
    lines: lines.map((l) => l.text),
    lineBaselines,
    lineHeight,
    width: approxWidth,
    charWidths,
    hasEmbeddedFont: !!first.embeddedFamily,
    embeddedFamily: first.embeddedFamily,
    embeddedBytes: first.embeddedBytes,
    matchedFontId: matchBundledFontId(first.fontName, text),
  };
}

/* ---------------- background sampling ---------------- */

/**
 * Sample the rendered page background around a screen-space rect and return
 * the median color as hex. Used to invisibly cover original text before
 * drawing replacement text. `rectCss` is in CSS px relative to the canvas.
 */
export function sampleBackgroundHex(
  canvas: HTMLCanvasElement,
  rectCss: { x: number; y: number; w: number; h: number }
): string {
  try {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return "#ffffff";
    const scaleX = canvas.width / Math.max(1, canvas.clientWidth);
    const scaleY = canvas.height / Math.max(1, canvas.clientHeight);
    const pad = 6;
    const sx = Math.max(0, Math.floor((rectCss.x - pad) * scaleX));
    const sy = Math.max(0, Math.floor((rectCss.y - pad) * scaleY));
    const sw = Math.min(canvas.width - sx, Math.ceil((rectCss.w + pad * 2) * scaleX));
    const sh = Math.min(canvas.height - sy, Math.ceil((rectCss.h + pad * 2) * scaleY));
    if (sw <= 0 || sh <= 0) return "#ffffff";
    const data = ctx.getImageData(sx, sy, sw, sh).data;
    // Ring sampling: pixels near the rect border (likely background, not glyphs).
    const ix0 = Math.floor(pad * scaleX);
    const iy0 = Math.floor(pad * scaleY);
    const ix1 = sw - ix0;
    const iy1 = sh - iy0;
    const rs: number[] = [];
    const gs: number[] = [];
    const bs: number[] = [];
    for (let y = 0; y < sh; y += 2) {
      for (let x = 0; x < sw; x += 2) {
        const outside = x < ix0 || x >= ix1 || y < iy0 || y >= iy1;
        if (!outside) continue;
        const o = (y * sw + x) * 4;
        const a = data[o + 3];
        if (a < 200) continue; // transparent
        rs.push(data[o]);
        gs.push(data[o + 1]);
        bs.push(data[o + 2]);
      }
    }
    if (rs.length < 8) return "#ffffff";
    const med = (arr: number[]) => {
      const s = [...arr].sort((p, q) => p - q);
      return s[Math.floor(s.length / 2)];
    };
    return rgb01ToHex(med(rs) / 255, med(gs) / 255, med(bs) / 255);
  } catch {
    return "#ffffff";
  }
}

/**
 * Sample the actual text glyph color directly from the rendered canvas within
 * the text block rect. Finds pixels that strongly contrast with the background
 * to identify glyph cores and extract their exact rendered color.
 */
export function sampleTextColorHex(
  canvas: HTMLCanvasElement,
  rectCss: { x: number; y: number; w: number; h: number },
  bgHex = "#ffffff"
): string | null {
  try {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    const scaleX = canvas.width / Math.max(1, canvas.clientWidth);
    const scaleY = canvas.height / Math.max(1, canvas.clientHeight);
    const sx = Math.max(0, Math.floor(rectCss.x * scaleX));
    const sy = Math.max(0, Math.floor(rectCss.y * scaleY));
    const sw = Math.min(canvas.width - sx, Math.ceil(rectCss.w * scaleX));
    const sh = Math.min(canvas.height - sy, Math.ceil(rectCss.h * scaleY));
    if (sw <= 0 || sh <= 0) return null;
    const data = ctx.getImageData(sx, sy, sw, sh).data;

    const bgRgb = hexToRgb01(bgHex);
    const bgR = Math.round(bgRgb.r * 255);
    const bgG = Math.round(bgRgb.g * 255);
    const bgB = Math.round(bgRgb.b * 255);

    // Collect pixels that contrast with the background
    const glyphPixels: { r: number; g: number; b: number; dist: number }[] = [];
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const o = (y * sw + x) * 4;
        const a = data[o + 3];
        if (a < 150) continue;
        const r = data[o];
        const g = data[o + 1];
        const b = data[o + 2];
        const dist = Math.hypot(r - bgR, g - bgG, b - bgB);
        if (dist > 35) {
          glyphPixels.push({ r, g, b, dist });
        }
      }
    }

    if (glyphPixels.length < 4) return null;

    // Sort by contrast from background to focus on solid glyph core pixels
    glyphPixels.sort((p, q) => q.dist - p.dist);
    const coreCount = Math.max(3, Math.floor(glyphPixels.length * 0.45));
    const core = glyphPixels.slice(0, coreCount);

    const med = (arr: number[]) => {
      const s = [...arr].sort((p, q) => p - q);
      return s[Math.floor(s.length / 2)];
    };
    return rgb01ToHex(
      med(core.map((p) => p.r)) / 255,
      med(core.map((p) => p.g)) / 255,
      med(core.map((p) => p.b)) / 255
    );
  } catch {
    return null;
  }
}
