import { PDFDocument } from "pdf-lib";
import { checkPdfEncryption } from "./security";

export interface MergeSourceFile {
  id: string;
  name: string;
  bytes: Uint8Array;
  size: number;
  pageCount: number;
}

/**
 * Merge multiple PDF byte arrays into a single combined PDF document.
 */
export async function mergePDFs(
  files: { bytes: Uint8Array; name: string }[],
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  if (files.length === 0) {
    throw new Error("Please select at least one PDF file to merge.");
  }

  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i + 1, files.length);

    const enc = await checkPdfEncryption(file.bytes);
    if (enc.encrypted) {
      throw new Error(`"${file.name}" is password-protected. Please unlock it using the Unlock PDF tool first.`);
    }

    try {
      const srcPdf = await PDFDocument.load(file.bytes, {
        ignoreEncryption: true,
      });
      const pageIndices = srcPdf.getPageIndices();
      const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("encrypt") || msg.toLowerCase().includes("password")) {
        throw new Error(`"${file.name}" is password-protected. Please unlock it using the Unlock PDF tool first.`);
      }
      throw new Error(`Failed to read "${file.name}": ${msg || "Invalid PDF file"}`);
    }
  }

  return await mergedPdf.save();
}
