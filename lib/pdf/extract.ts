import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

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
  onProgress?: (current: number, total: number) => void
): Promise<ExtractResult> {
  if (selectedPageIndices.length === 0) {
    throw new Error("Please select at least one page to extract.");
  }

  // Sort and deduplicate indices
  const sortedIndices = Array.from(new Set(selectedPageIndices)).sort((a, b) => a - b);
  const srcDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
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

    const bytes = await outDoc.save({ useObjectStreams: true });
    return {
      bytes,
      filename: `${baseName}-extracted.pdf`,
      type: "pdf",
      count: sortedIndices.length,
    };
  } else {
    // Mode: zip-separate
    const zip = new JSZip();

    for (let i = 0; i < sortedIndices.length; i++) {
      const pageIdx = sortedIndices[i];
      const pageDoc = await PDFDocument.create();
      const [copiedPage] = await pageDoc.copyPages(srcDoc, [pageIdx]);
      pageDoc.addPage(copiedPage);

      const singlePdfBytes = await pageDoc.save({ useObjectStreams: true });
      const paddedNum = String(pageIdx + 1).padStart(3, "0");
      zip.file(`${baseName}-page-${paddedNum}.pdf`, singlePdfBytes);

      if (onProgress) {
        onProgress(i + 1, sortedIndices.length);
      }
    }

    const zipBlob = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    return {
      bytes: zipBlob,
      filename: `${baseName}-extracted-pages.zip`,
      type: "zip",
      count: sortedIndices.length,
    };
  }
}
