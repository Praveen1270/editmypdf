import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getPdfjs } from "./pdf-loader";

export interface DetectedTextItem {
  id: string; // e.g. "p0-item-3"
  pageIndex: number; // 0-indexed
  pageNumber: number; // 1-indexed
  text: string;
  baselineX: number; // PDF points from left
  baselineY: number; // PDF points from bottom (baseline)
  boxX: number; // PDF points bounding box left
  boxY: number; // PDF points bounding box bottom
  boxWidth: number; // PDF points width
  boxHeight: number; // PDF points height
  fontSize: number;
  fontFamilyName: string; // original font descriptor from PDF
  matchedFontFamily: "Helvetica" | "TimesRoman" | "Courier";
  isBold: boolean;
  isItalic: boolean;
  colorHex: string;
}

export interface PageTextExtraction {
  pageIndex: number; // 0-indexed
  pageNumber: number; // 1-indexed
  pageWidth: number; // in PDF points
  pageHeight: number; // in PDF points
  items: DetectedTextItem[];
  rawTextLength: number;
  isScanned: boolean; // true if page contains negligible text (< 10 chars)
}

export interface AppliedTextEdit {
  id: string;
  pageIndex: number;
  originalText: string;
  replacementText: string;
  boxX: number;
  boxY: number;
  boxWidth: number;
  boxHeight: number;
  baselineX: number;
  baselineY: number;
  fontFamily: "Helvetica" | "TimesRoman" | "Courier";
  fontSize: number;
  colorHex: string;
  backgroundColorHex: string; // patch color to cleanly cover original text
  isBold: boolean;
  isItalic: boolean;
  autoFitWidth?: boolean;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const int = parseInt(clean, 16);
  if (isNaN(int)) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: Math.max(0, Math.min(1, ((int >> 16) & 255) / 255)),
    g: Math.max(0, Math.min(1, ((int >> 8) & 255) / 255)),
    b: Math.max(0, Math.min(1, (int & 255) / 255)),
  };
}

/**
 * Maps arbitrary PDF font names and styles to compatible Standard PDF Fonts.
 */
export function matchFontFamily(fontName: string): "Helvetica" | "TimesRoman" | "Courier" {
  const lower = (fontName || "").toLowerCase();
  if (
    lower.includes("courier") ||
    lower.includes("mono") ||
    lower.includes("code") ||
    lower.includes("consolas") ||
    lower.includes("typewriter")
  ) {
    return "Courier";
  }
  if (
    lower.includes("times") ||
    lower.includes("serif") ||
    lower.includes("georgia") ||
    lower.includes("roman") ||
    lower.includes("palatino") ||
    lower.includes("baskerville")
  ) {
    return "TimesRoman";
  }
  return "Helvetica";
}

/**
 * Detects bold font weight from font descriptor names.
 */
export function detectIsBold(fontName: string): boolean {
  const lower = (fontName || "").toLowerCase();
  return (
    lower.includes("bold") ||
    lower.includes("black") ||
    lower.includes("heavy") ||
    lower.includes("demi") ||
    lower.includes("700") ||
    lower.includes("800") ||
    lower.includes("900")
  );
}

/**
 * Detects italic / oblique slant from font descriptor names.
 */
export function detectIsItalic(fontName: string): boolean {
  const lower = (fontName || "").toLowerCase();
  return (
    lower.includes("italic") ||
    lower.includes("oblique") ||
    lower.includes("slant") ||
    lower.includes("inclined")
  );
}

/**
 * Extracts selectable text items, bounding boxes, typographic metadata,
 * and detects scanned documents for a given page.
 */
export async function extractPageText(
  pdfBytes: Uint8Array,
  pageNumber: number, // 1-indexed
  password?: string
): Promise<PageTextExtraction> {
  const pdfjs = await getPdfjs();
  const loadingTask = pdfjs.getDocument({
    data: pdfBytes.slice(),
    password: password || undefined,
  });

  const doc = await loadingTask.promise;
  try {
    const pageIndex = pageNumber - 1;
    const page = await doc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    const items: DetectedTextItem[] = [];
    let rawTextLength = 0;

    for (let i = 0; i < textContent.items.length; i++) {
      const item: any = textContent.items[i];
      if (!item.str || item.str.trim().length === 0) continue;

      const text = item.str;
      rawTextLength += text.length;

      const transform = item.transform || [1, 0, 0, 1, 0, 0];
      // transform: [scaleX, skewY, skewX, scaleY, tx, ty]
      const scaleX = transform[0];
      const scaleY = transform[3];
      const calculatedFontSize = Math.max(6, Math.abs(scaleY || scaleX || 12));
      const fontSize = Math.round(calculatedFontSize * 10) / 10;

      const baselineX = transform[4];
      const baselineY = transform[5];

      // Measured width in PDF points
      const itemWidth = Math.max(item.width || 0, fontSize * 0.5 * text.length);

      // Bounding box in PDF points (origin at bottom-left)
      // Ascent is typically ~0.8 * fontSize, descent ~0.25 * fontSize
      const descentOffset = fontSize * 0.25;
      const boxX = baselineX;
      const boxY = Math.max(0, baselineY - descentOffset);
      const boxWidth = itemWidth;
      const boxHeight = Math.max(fontSize * 1.2, item.height || 10);

      const fontName = item.fontName || "Helvetica";
      const styleObj = textContent.styles ? textContent.styles[fontName] : null;
      const combinedFontDesc = `${fontName} ${styleObj?.fontFamily || ""}`;

      const matchedFamily = matchFontFamily(combinedFontDesc);
      const isBold = detectIsBold(combinedFontDesc);
      const isItalic = detectIsItalic(combinedFontDesc);

      items.push({
        id: `p${pageIndex}-item-${i}`,
        pageIndex,
        pageNumber,
        text,
        baselineX,
        baselineY,
        boxX,
        boxY,
        boxWidth,
        boxHeight,
        fontSize,
        fontFamilyName: fontName,
        matchedFontFamily: matchedFamily,
        isBold,
        isItalic,
        colorHex: "#000000",
      });
    }

    const isScanned = rawTextLength < 10 || items.length === 0;

    return {
      pageIndex,
      pageNumber,
      pageWidth: viewport.width,
      pageHeight: viewport.height,
      items,
      rawTextLength,
      isScanned,
    };
  } finally {
    await doc.destroy();
  }
}

/**
 * Replaces selected text items in a PDF document using exact background-obscuring
 * geometry and matching Standard PDF font rendering.
 */
export async function applyTextEditsToPdf(
  originalPdfBytes: Uint8Array,
  edits: AppliedTextEdit[]
): Promise<Uint8Array> {
  if (edits.length === 0) {
    return originalPdfBytes;
  }

  const doc = await PDFDocument.load(originalPdfBytes.slice(), { ignoreEncryption: true });

  // Pre-embed standard fonts to ensure instant rendering
  const fontCache = {
    Helvetica: await doc.embedFont(StandardFonts.Helvetica),
    HelveticaBold: await doc.embedFont(StandardFonts.HelveticaBold),
    HelveticaOblique: await doc.embedFont(StandardFonts.HelveticaOblique),
    HelveticaBoldOblique: await doc.embedFont(StandardFonts.HelveticaBoldOblique),
    TimesRoman: await doc.embedFont(StandardFonts.TimesRoman),
    TimesRomanBold: await doc.embedFont(StandardFonts.TimesRomanBold),
    TimesRomanItalic: await doc.embedFont(StandardFonts.TimesRomanItalic),
    TimesRomanBoldItalic: await doc.embedFont(StandardFonts.TimesRomanBoldItalic),
    Courier: await doc.embedFont(StandardFonts.Courier),
    CourierBold: await doc.embedFont(StandardFonts.CourierBold),
    CourierOblique: await doc.embedFont(StandardFonts.CourierOblique),
    CourierBoldOblique: await doc.embedFont(StandardFonts.CourierBoldOblique),
  };

  const totalPages = doc.getPageCount();

  for (const edit of edits) {
    if (edit.pageIndex < 0 || edit.pageIndex >= totalPages) continue;
    const page = doc.getPage(edit.pageIndex);
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // 1. Obscure the original text region with a calibrated background patch
    const bgRgb = hexToRgb(edit.backgroundColorHex || "#FFFFFF");
    page.drawRectangle({
      x: Math.max(0, edit.boxX - 1),
      y: Math.max(0, edit.boxY - 1),
      width: Math.min(pageWidth - edit.boxX + 1, edit.boxWidth + 2),
      height: Math.min(pageHeight - edit.boxY + 1, edit.boxHeight + 2),
      color: rgb(bgRgb.r, bgRgb.g, bgRgb.b),
      borderWidth: 0,
      opacity: 1.0,
    });

    // If replacement text is empty or only whitespace, the text has been deleted/redacted cleanly.
    if (!edit.replacementText || edit.replacementText.trim().length === 0) {
      continue;
    }

    // 2. Select appropriate embedded font variant
    let fontVariantKey = edit.fontFamily as keyof typeof fontCache;
    if (edit.fontFamily === "TimesRoman") {
      if (edit.isBold && edit.isItalic) fontVariantKey = "TimesRomanBoldItalic";
      else if (edit.isBold) fontVariantKey = "TimesRomanBold";
      else if (edit.isItalic) fontVariantKey = "TimesRomanItalic";
    } else if (edit.fontFamily === "Courier") {
      if (edit.isBold && edit.isItalic) fontVariantKey = "CourierBoldOblique";
      else if (edit.isBold) fontVariantKey = "CourierBold";
      else if (edit.isItalic) fontVariantKey = "CourierOblique";
    } else {
      if (edit.isBold && edit.isItalic) fontVariantKey = "HelveticaBoldOblique";
      else if (edit.isBold) fontVariantKey = "HelveticaBold";
      else if (edit.isItalic) fontVariantKey = "HelveticaOblique";
    }

    const selectedFont = fontCache[fontVariantKey] || fontCache.Helvetica;

    // 3. Handle fit & scaling if replacement text is longer than original bounding box
    let finalFontSize = edit.fontSize;
    const naturalWidth = selectedFont.widthOfTextAtSize(edit.replacementText, finalFontSize);

    if (edit.autoFitWidth && naturalWidth > edit.boxWidth && edit.boxWidth > 0) {
      const shrinkRatio = edit.boxWidth / naturalWidth;
      // Gently scale down font size up to 50% to fit within the original boundaries
      finalFontSize = Math.max(6, Math.floor(finalFontSize * shrinkRatio * 10) / 10);
    }

    const textRgb = hexToRgb(edit.colorHex || "#000000");

    // 4. Draw replacement text at exact baseline coordinates
    page.drawText(edit.replacementText, {
      x: edit.baselineX,
      y: edit.baselineY,
      size: finalFontSize,
      font: selectedFont,
      color: rgb(textRgb.r, textRgb.g, textRgb.b),
      opacity: 1.0,
    });
  }

  return await doc.save({ useObjectStreams: true });
}
