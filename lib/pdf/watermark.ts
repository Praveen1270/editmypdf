import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { parsePageRangeString } from "./split";

export type WatermarkPreset = "diagonal" | "center" | "footer";

export interface WatermarkOptions {
  text: string;
  preset: WatermarkPreset;
  opacity: number; // 0.05 to 1.0
  fontSize: number; // e.g. 20 to 80
  rotation: number; // -90 to 90
  allPages: boolean;
  pageRangeStr?: string;
  colorHex: string; // e.g. "#6B7280"
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const intVal = parseInt(clean, 16);
  const r = ((intVal >> 16) & 255) / 255;
  const g = ((intVal >> 8) & 255) / 255;
  const b = (intVal & 255) / 255;
  return { r, g, b };
}

export async function addWatermark(
  pdfBytes: Uint8Array,
  options: WatermarkOptions
): Promise<Uint8Array> {
  if (!options.text.trim()) {
    throw new Error("Watermark text cannot be empty.");
  }

  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const totalPages = doc.getPageCount();

  let targetIndices: number[];
  if (options.allPages || !options.pageRangeStr) {
    targetIndices = Array.from({ length: totalPages }, (_, i) => i);
  } else {
    targetIndices = parsePageRangeString(options.pageRangeStr, totalPages);
  }

  const rgbColor = hexToRgb(options.colorHex || "#6B7280");
  const color = rgb(rgbColor.r, rgbColor.g, rgbColor.b);

  for (const pageIdx of targetIndices) {
    const page = doc.getPage(pageIdx);
    const { width, height } = page.getSize();

    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    let x: number;
    let y: number;
    let rotDeg: number = options.rotation;

    if (options.preset === "footer") {
      rotDeg = 0;
      x = (width - textWidth) / 2;
      y = 35;
    } else if (options.preset === "center") {
      rotDeg = 0;
      x = (width - textWidth) / 2;
      y = (height - textHeight) / 2;
    } else {
      // diagonal preset
      rotDeg = options.rotation || 45;
      const rad = (rotDeg * Math.PI) / 180;
      // Approximate center offset when rotated around its origin
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      x = (width - cos * textWidth + sin * textHeight) / 2;
      y = (height - sin * textWidth - cos * textHeight) / 2;
    }

    page.drawText(options.text, {
      x,
      y,
      size: options.fontSize,
      font,
      color,
      opacity: options.opacity,
      rotate: degrees(rotDeg),
    });
  }

  return await doc.save();
}
