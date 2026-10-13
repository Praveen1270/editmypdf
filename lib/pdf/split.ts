import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

/**
 * Parses user input page ranges like "1-3, 5, 8-10" into 0-indexed page indices.
 * Validates against maxPages.
 */
export function parsePageRangeString(rangeStr: string, maxPages: number): number[] {
  const trimmed = rangeStr.trim();
  if (!trimmed) {
    throw new Error("Page range cannot be empty.");
  }

  const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  const selectedIndices = new Set<number>();

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid range format: "${part}". Expected format like "1-5".`);
      }
      if (start < 1 || end < 1) {
        throw new Error(`Page numbers must be greater than or equal to 1: "${part}".`);
      }
      if (start > end) {
        throw new Error(`Invalid range "${part}": start page (${start}) is greater than end page (${end}).`);
      }
      if (start > maxPages || end > maxPages) {
        throw new Error(`Page range "${part}" exceeds document length (${maxPages} pages).`);
      }

      for (let i = start; i <= end; i++) {
        selectedIndices.add(i - 1);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum)) {
        throw new Error(`Invalid page number: "${part}".`);
      }
      if (pageNum < 1 || pageNum > maxPages) {
        throw new Error(`Page number ${pageNum} is out of range. Document has ${maxPages} pages.`);
      }
      selectedIndices.add(pageNum - 1);
    }
  }

  const sorted = Array.from(selectedIndices).sort((a, b) => a - b);
  if (sorted.length === 0) {
    throw new Error("No valid pages were selected.");
  }
  return sorted;
}

export type SplitMode = "extract-single" | "split-all" | "extract-separate";

export interface SplitResult {
  type: "pdf" | "zip";
  bytes: Uint8Array;
  filename: string;
  count: number;
}

export async function splitPDF(
  pdfBytes: Uint8Array,
  baseFilename: string,
  mode: SplitMode,
  rangeStr?: string,
  onProgress?: (current: number, total: number) => void
): Promise<SplitResult> {
  const cleanBase = baseFilename.replace(/\.pdf$/i, "");
  const srcDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  if (mode === "extract-single") {
    if (!rangeStr) throw new Error("Please specify pages to extract.");
    const indices = parsePageRangeString(rangeStr, totalPages);
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(srcDoc, indices);
    copied.forEach((p) => newDoc.addPage(p));
    const resultBytes = await newDoc.save();
    return {
      type: "pdf",
      bytes: resultBytes,
      filename: `${cleanBase}-extracted.pdf`,
      count: indices.length,
    };
  }

  if (mode === "split-all") {
    const zip = new JSZip();
    for (let i = 0; i < totalPages; i++) {
      onProgress?.(i + 1, totalPages);
      const singleDoc = await PDFDocument.create();
      const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
      singleDoc.addPage(copiedPage);
      const pageBytes = await singleDoc.save();
      zip.file(`${cleanBase}-page-${i + 1}.pdf`, pageBytes);
    }
    const zipBuffer = await zip.generateAsync({ type: "uint8array" });
    return {
      type: "zip",
      bytes: zipBuffer,
      filename: `${cleanBase}-pages.zip`,
      count: totalPages,
    };
  }

  // extract-separate: each page in selected range as a separate PDF in ZIP
  if (!rangeStr) throw new Error("Please specify pages to extract.");
  const indices = parsePageRangeString(rangeStr, totalPages);
  const zip = new JSZip();
  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    onProgress?.(i + 1, indices.length);
    const singleDoc = await PDFDocument.create();
    const [copiedPage] = await singleDoc.copyPages(srcDoc, [idx]);
    singleDoc.addPage(copiedPage);
    const pageBytes = await singleDoc.save();
    zip.file(`${cleanBase}-page-${idx + 1}.pdf`, pageBytes);
  }
  const zipBuffer = await zip.generateAsync({ type: "uint8array" });
  return {
    type: "zip",
    bytes: zipBuffer,
    filename: `${cleanBase}-extracted-pages.zip`,
    count: indices.length,
  };
}
