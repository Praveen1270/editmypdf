import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { getPdfJs } from "./pdf-loader";
import type { PDFDocumentProxy } from "pdfjs-dist";

/**
 * Single PDF pipeline for all lib/pdf tools: one way to load, save, open
 * with pdf.js, extract text, convert colours, size pages, zip outputs and
 * report progress. Tools should use these helpers instead of re-implementing
 * the same boilerplate (pdf-lib load/save options, the pdf.js .slice() copy
 * that avoids neutering the caller's ArrayBuffer, the text line-grouping
 * sort, hex parsing, page-size tables and JSZip setup).
 */

export type ProgressFn = (current: number, total: number, stage?: string) => void;

export const PDF_ERRORS = {
  passwordProtected:
    "This document is password-protected. Please unlock it using the Unlock PDF tool first.",
  noPagesSelected: "Please select at least one page to extract.",
  canvasUnavailable: "Canvas context unavailable",
  readFailed: "Failed to read PDF",
} as const;

export async function loadPdf(bytes: Uint8Array): Promise<PDFDocument> {
  // pdf-lib's LoadOptions has no password field: it cannot open a
  // password-protected PDF with a password. Password handling lives in the
  // pdf.js path (getPdfInfo / the Unlock tool); here we only ignore the
  // encryption flag so unprotected-but-flagged files still load.
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}

export async function savePdf(doc: PDFDocument): Promise<Uint8Array> {
  return doc.save({ useObjectStreams: true });
}

export async function openPdfJs(
  bytes: Uint8Array,
  opts?: { disableAutoFetch?: boolean }
): Promise<PDFDocumentProxy> {
  const pdfjs = await getPdfJs();
  const task = pdfjs.getDocument({ data: bytes.slice(), ...opts });
  return task.promise;
}

function sortTextItems<T extends { transform: number[]; str?: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const ay = a.transform[5];
    const by = b.transform[5];
    if (Math.abs(ay - by) > 3) return by - ay;
    return a.transform[4] - b.transform[4];
  });
}

export async function extractTextLines(
  bytes: Uint8Array,
  opts?: { onProgress?: ProgressFn }
): Promise<string[][]> {
  const doc = await openPdfJs(bytes);
  try {
    const pages: string[][] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let current = "";
      let lastY: number | null = null;
      for (const item of sortTextItems(
        content.items as unknown as { transform: number[]; str?: string }[]
      )) {
        const y = item.transform[5];
        if (lastY !== null && Math.abs(y - lastY) > 3) {
          if (current.trim()) lines.push(current.trim());
          current = "";
        }
        current += (item.str || "") + " ";
        lastY = y;
      }
      if (current.trim()) lines.push(current.trim());
      pages.push(lines);
      opts?.onProgress?.(p, doc.numPages);
    }
    return pages;
  } finally {
    await doc.destroy();
  }
}

export async function extractText(bytes: Uint8Array, opts?: { onProgress?: ProgressFn }): Promise<string> {
  const pages = await extractTextLines(bytes, opts);
  return pages.map((lines) => lines.join("\n")).join("\n");
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
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

export const hexToRgb01 = hexToRgb;

export const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  a3: { width: 841.89, height: 1190.55 },
  letter: { width: 612, height: 792 },
  legal: { width: 612, height: 1008 },
  a5: { width: 419.53, height: 595.28 },
};

export async function zipFiles(files: { name: string; data: Uint8Array }[]): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const f of files) {
    zip.file(f.name, f.data);
  }
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
}
