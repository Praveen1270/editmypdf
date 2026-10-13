import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type TextPositionPreset = "header" | "footer" | "center" | "custom";

export interface AddTextOptions {
  text: string;
  pageIndices: number[]; // 0-indexed page indices
  positionPreset?: TextPositionPreset;
  x?: number; // coordinate in PDF points from left
  y?: number; // coordinate in PDF points from bottom
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
 * Adds text overlays onto selected pages at specified coordinates or presets.
 */
export async function addTextToPdf(
  pdfBytes: Uint8Array,
  options: AddTextOptions
): Promise<Uint8Array> {
  const {
    text,
    pageIndices,
    positionPreset = "custom",
    x = 54,
    y = 54,
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

    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    let drawX = x;
    let drawY = y;

    if (positionPreset === "header") {
      drawX = (width - textWidth) / 2;
      drawY = height - 40 - textHeight;
    } else if (positionPreset === "footer") {
      drawX = (width - textWidth) / 2;
      drawY = 40;
    } else if (positionPreset === "center") {
      drawX = (width - textWidth) / 2;
      drawY = (height - textHeight) / 2;
    } else {
      drawX = Math.max(0, Math.min(drawX, width - 10));
      drawY = Math.max(0, Math.min(drawY, height - 10));
    }

    page.drawText(text, {
      x: drawX,
      y: drawY,
      size: fontSize,
      font,
      color,
      opacity,
    });
  }

  return await doc.save({ useObjectStreams: true });
}
