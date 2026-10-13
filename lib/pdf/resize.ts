import { PDFDocument } from "pdf-lib";

export type TargetPageSize = "a4" | "a3" | "letter" | "legal" | "custom";
export type ResizeOrientation = "auto" | "portrait" | "landscape";

export interface ResizeOptions {
  pageSize: TargetPageSize;
  orientation?: ResizeOrientation;
  customWidth?: number; // in points
  customHeight?: number; // in points
}

const STANDARD_SIZES: Record<Exclude<TargetPageSize, "custom">, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  a3: { width: 841.89, height: 1190.55 },
  letter: { width: 612.0, height: 792.0 },
  legal: { width: 612.0, height: 1008.0 },
};

/**
 * Resizes PDF pages to standard or custom dimensions with proportional content scaling.
 */
export async function resizePdfPages(
  pdfBytes: Uint8Array,
  options: ResizeOptions,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const { pageSize, orientation = "auto", customWidth = 612, customHeight = 792 } = options;

  let baseDimensions: { width: number; height: number };
  if (pageSize === "custom") {
    baseDimensions = { width: customWidth, height: customHeight };
  } else {
    baseDimensions = STANDARD_SIZES[pageSize];
  }

  const srcDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const outDoc = await PDFDocument.create();
  const totalPages = srcDoc.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const srcPage = srcDoc.getPage(i);
    const { width: srcW, height: srcH } = srcPage.getSize();

    // Determine target orientation
    let targetW = baseDimensions.width;
    let targetH = baseDimensions.height;

    if (orientation === "landscape") {
      targetW = Math.max(baseDimensions.width, baseDimensions.height);
      targetH = Math.min(baseDimensions.width, baseDimensions.height);
    } else if (orientation === "portrait") {
      targetW = Math.min(baseDimensions.width, baseDimensions.height);
      targetH = Math.max(baseDimensions.width, baseDimensions.height);
    } else {
      // auto: match aspect ratio of source page
      const isSrcLandscape = srcW > srcH;
      if (isSrcLandscape) {
        targetW = Math.max(baseDimensions.width, baseDimensions.height);
        targetH = Math.min(baseDimensions.width, baseDimensions.height);
      } else {
        targetW = Math.min(baseDimensions.width, baseDimensions.height);
        targetH = Math.max(baseDimensions.width, baseDimensions.height);
      }
    }

    // Embed source page
    const embeddedPage = await outDoc.embedPage(srcPage);

    // Compute proportional fit
    const scale = Math.min(targetW / srcW, targetH / srcH);
    const scaledW = srcW * scale;
    const scaledH = srcH * scale;
    const offsetX = (targetW - scaledW) / 2;
    const offsetY = (targetH - scaledH) / 2;

    const outPage = outDoc.addPage([targetW, targetH]);
    outPage.drawPage(embeddedPage, {
      x: offsetX,
      y: offsetY,
      width: scaledW,
      height: scaledH,
    });

    if (onProgress) {
      onProgress(i + 1, totalPages);
    }
  }

  return await outDoc.save({ useObjectStreams: true });
}
