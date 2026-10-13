import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface AddTextOptions {
  text: string;
  pageIndices: number[]; // 0-indexed page indices
  x: number; // coordinate in PDF points from left
  y: number; // coordinate in PDF points from bottom
  fontSize?: number;
  colorHex?: string;
  opacity?: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const int = parseInt(clean, 16);
  if (isNaN(int)) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: ((int >> 16) & 255) / 255,
    g: ((int >> 8) & 255) / 255,
    b: (int & 255) / 255,
  };
}

/**
 * Adds text overlays onto selected pages at specified coordinates.
 */
export async function addTextToPdf(
  pdfBytes: Uint8Array,
  options: AddTextOptions
): Promise<Uint8Array> {
  const {
    text,
    pageIndices,
    x,
    y,
    fontSize = 14,
    colorHex = "#000000",
    opacity = 1.0,
  } = options;

  if (!text || text.trim().length === 0) {
    throw new Error("Text content cannot be empty.");
  }

  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const { r, g, b } = hexToRgb(colorHex);
  const color = rgb(r, g, b);

  const totalPages = doc.getPageCount();

  for (const pageIdx of pageIndices) {
    if (pageIdx < 0 || pageIdx >= totalPages) continue;
    const page = doc.getPage(pageIdx);
    const { width, height } = page.getSize();

    // Ensure coordinates stay within page boundary margins
    const clampedX = Math.max(10, Math.min(x, width - 20));
    const clampedY = Math.max(10, Math.min(y, height - 20));

    page.drawText(text, {
      x: clampedX,
      y: clampedY,
      size: fontSize,
      font,
      color,
      opacity,
    });
  }

  return await doc.save({ useObjectStreams: true });
}
