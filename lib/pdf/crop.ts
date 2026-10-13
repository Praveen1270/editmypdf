import { PDFDocument } from "pdf-lib";

export interface CropMargins {
  top: number; // in points
  bottom: number;
  left: number;
  right: number;
}

export interface CropOptions {
  margins: CropMargins;
  pageIndices?: number[]; // if omitted, applies to all pages
}

/**
 * Adjusts page viewing boundary (CropBox) by trimming specified margins.
 */
export async function cropPdf(
  pdfBytes: Uint8Array,
  options: CropOptions
): Promise<Uint8Array> {
  const { margins, pageIndices } = options;
  const { top, bottom, left, right } = margins;

  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = doc.getPageCount();

  const targetIndices =
    pageIndices && pageIndices.length > 0
      ? pageIndices
      : Array.from({ length: totalPages }, (_, i) => i);

  for (const idx of targetIndices) {
    if (idx < 0 || idx >= totalPages) continue;
    const page = doc.getPage(idx);
    const { width, height } = page.getSize();

    const cropX = Math.max(0, left);
    const cropY = Math.max(0, bottom);
    const cropWidth = Math.max(50, width - left - right);
    const cropHeight = Math.max(50, height - top - bottom);

    if (cropWidth <= 0 || cropHeight <= 0) {
      throw new Error(`Crop margins exceed page dimensions on page ${idx + 1}.`);
    }

    page.setCropBox(cropX, cropY, cropWidth, cropHeight);
  }

  return await doc.save({ useObjectStreams: true });
}
