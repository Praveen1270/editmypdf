import { PDFDocument } from "pdf-lib";
import { loadPdf, savePdf, zipFiles, ProgressFn, PDF_ERRORS } from "./core";
import { parsePageRangeString } from "./page-range";

// Re-exported so existing importers keep working; new code should import
// parsePageRangeString from ./page-range directly.
export { parsePageRangeString } from "./page-range";

export type SplitMode = "extract-single" | "split-all" | "extract-separate";

export interface SplitResult {
  type: "pdf" | "zip";
  bytes: Uint8Array;
  filename: string;
  count: number;
}

async function copyPagesToPdf(srcDoc: PDFDocument, indices: number[]): Promise<Uint8Array> {
  const newDoc = await PDFDocument.create();
  const copied = await newDoc.copyPages(srcDoc, indices);
  copied.forEach((p) => newDoc.addPage(p));
  return savePdf(newDoc);
}

async function copyPagesToZip(
  srcDoc: PDFDocument,
  indices: number[],
  nameFor: (pageIndex: number) => string,
  onProgress?: ProgressFn
): Promise<Uint8Array> {
  const files: { name: string; data: Uint8Array }[] = [];
  for (let i = 0; i < indices.length; i++) {
    onProgress?.(i + 1, indices.length);
    files.push({ name: nameFor(indices[i]), data: await copyPagesToPdf(srcDoc, [indices[i]]) });
  }
  return zipFiles(files);
}

export async function splitPDF(
  pdfBytes: Uint8Array,
  baseFilename: string,
  mode: SplitMode,
  rangeStr?: string,
  onProgress?: ProgressFn
): Promise<SplitResult> {
  const cleanBase = baseFilename.replace(/\.pdf$/i, "");
  const srcDoc = await loadPdf(pdfBytes);
  const totalPages = srcDoc.getPageCount();

  if (mode === "extract-single") {
    if (!rangeStr) throw new Error(PDF_ERRORS.noPagesSelected);
    const indices = parsePageRangeString(rangeStr, totalPages);
    const resultBytes = await copyPagesToPdf(srcDoc, indices);
    return {
      type: "pdf",
      bytes: resultBytes,
      filename: `${cleanBase}-extracted.pdf`,
      count: indices.length,
    };
  }

  if (mode === "split-all") {
    const indices = Array.from({ length: totalPages }, (_, i) => i);
    const zipBuffer = await copyPagesToZip(
      srcDoc,
      indices,
      (i) => `${cleanBase}-page-${i + 1}.pdf`,
      onProgress
    );
    return {
      type: "zip",
      bytes: zipBuffer,
      filename: `${cleanBase}-pages.zip`,
      count: totalPages,
    };
  }

  // extract-separate: each page in selected range as a separate PDF in ZIP
  if (!rangeStr) throw new Error(PDF_ERRORS.noPagesSelected);
  const indices = parsePageRangeString(rangeStr, totalPages);
  const zipBuffer = await copyPagesToZip(
    srcDoc,
    indices,
    (idx) => `${cleanBase}-page-${idx + 1}.pdf`,
    onProgress
  );
  return {
    type: "zip",
    bytes: zipBuffer,
    filename: `${cleanBase}-extracted-pages.zip`,
    count: indices.length,
  };
}
