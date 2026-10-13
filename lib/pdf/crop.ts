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

    if (left + right >= width) {
      throw new Error(
        `Horizontal crop margins (${left + right} pt) exceed page width (${Math.round(width)} pt) on page ${idx + 1}.`
      );
    }
    if (top + bottom >= height) {
      throw new Error(
        `Vertical crop margins (${top + bottom} pt) exceed page height (${Math.round(height)} pt) on page ${idx + 1}.`
      );
    }

    const cropX = Math.max(0, left);
    const cropY = Math.max(0, bottom);
    const cropWidth = width - left - right;
    const cropHeight = height - top - bottom;

    page.setCropBox(cropX, cropY, cropWidth, cropHeight);
  }

  return await doc.save({ useObjectStreams: true });
}
