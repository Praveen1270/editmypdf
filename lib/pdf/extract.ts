import { PDFDocument } from "pdf-lib";
import { loadPdf, savePdf, zipFiles, ProgressFn, PDF_ERRORS } from "./core";

export type ExtractMode = "single-pdf" | "zip-separate";

export interface ExtractResult {
  bytes: Uint8Array;
  filename: string;
  type: "pdf" | "zip";
  count: number;
}

/**
 * Extracts selected pages into either a single combined PDF or separate PDFs bundled into a ZIP archive.
 */
export async function extractPdfPages(
  pdfBytes: Uint8Array,
  originalFilename: string,
  selectedPageIndices: number[],
  mode: ExtractMode = "single-pdf",
  onProgress?: ProgressFn
): Promise<ExtractResult> {
  if (selectedPageIndices.length === 0) {
    throw new Error(PDF_ERRORS.noPagesSelected);
  }

  const sortedIndices = Array.from(new Set(selectedPageIndices)).sort((a, b) => a - b);
  const srcDoc = await loadPdf(pdfBytes);
  const baseName = originalFilename.replace(/\.pdf$/i, "");

  if (mode === "single-pdf") {
    const outDoc = await PDFDocument.create();
    const copiedPages = await outDoc.copyPages(srcDoc, sortedIndices);

    for (let i = 0; i < copiedPages.length; i++) {
      outDoc.addPage(copiedPages[i]);
      if (onProgress) {
        onProgress(i + 1, copiedPages.length);
      }
    }

    const bytes = await savePdf(outDoc);
    return {
      bytes,
      filename: `${baseName}-extracted.pdf`,
      type: "pdf",
      count: sortedIndices.length,
    };
  } else {
    const files: { name: string; data: Uint8Array }[] = [];

    for (let i = 0; i < sortedIndices.length; i++) {
      const pageIdx = sortedIndices[i];
      const pageDoc = await PDFDocument.create();
      const [copiedPage] = await pageDoc.copyPages(srcDoc, [pageIdx]);
      pageDoc.addPage(copiedPage);

      const singlePdfBytes = await savePdf(pageDoc);
      const paddedNum = String(pageIdx + 1).padStart(3, "0");
      files.push({ name: `${baseName}-page-${paddedNum}.pdf`, data: singlePdfBytes });

      if (onProgress) {
        onProgress(i + 1, sortedIndices.length);
      }
    }

    const zipBlob = await zipFiles(files);

    return {
      bytes: zipBlob,
      filename: `${baseName}-extracted-pages.zip`,
      type: "zip",
      count: sortedIndices.length,
    };
  }
}
