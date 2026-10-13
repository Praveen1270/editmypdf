import { PDFDocument, degrees } from "pdf-lib";

export interface OrganizedPageItem {
  id: string;
  originalIndex: number;
  rotation: number; // 0, 90, 180, 270
}

/**
 * Reorganizes PDF pages: supports reordering, duplicating, deleting, and rotating individual pages.
 */
export async function organizePdf(
  pdfBytes: Uint8Array,
  pageItems: OrganizedPageItem[],
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  if (pageItems.length === 0) {
    throw new Error("Cannot generate a PDF with zero pages. Please keep at least one page.");
  }

  const srcDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const outDoc = await PDFDocument.create();

  const total = pageItems.length;

  for (let i = 0; i < total; i++) {
    const item = pageItems[i];
    const [copiedPage] = await outDoc.copyPages(srcDoc, [item.originalIndex]);

    if (item.rotation) {
      const currentRotation = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((currentRotation + item.rotation) % 360));
    }

    outDoc.addPage(copiedPage);

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return await outDoc.save({ useObjectStreams: true });
}
