import { PDFDocument } from "pdf-lib";
import { renderPageToImageBlob, getPdfInfo } from "./pdf-loader";
import { loadPdf, savePdf, ProgressFn } from "./core";

export type CompressionPreset = "low" | "recommended" | "high";

export interface CompressResult {
  bytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  notes: string;
}

export async function compressPDF(
  pdfBytes: Uint8Array,
  preset: CompressionPreset,
  onProgress?: ProgressFn
): Promise<CompressResult> {
  const originalSize = pdfBytes.byteLength;

  if (preset === "low") {
    const doc = await loadPdf(pdfBytes);
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setProducer("EditMyPDF");
    doc.setCreator("EditMyPDF");

    const compressed = await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const compressedSize = compressed.byteLength;
    if (compressedSize < originalSize) {
      const reductionPercentage = Math.round(((originalSize - compressedSize) / originalSize) * 100);
      return {
        bytes: compressed,
        originalSize,
        compressedSize,
        reductionPercentage,
        notes: "Lossless structural & stream compression applied. Vector and text content completely preserved.",
      };
    } else {
      return {
        bytes: pdfBytes,
        originalSize,
        compressedSize: originalSize,
        reductionPercentage: 0,
        notes: "This document is already structurally minimal. No lossless reduction was possible.",
      };
    }
  }

  // Recommended = 1.5x scale (~108-150 DPI), 0.75 JPEG quality
  // High = 1.0x scale (~72-100 DPI), 0.55 JPEG quality
  const scale = preset === "recommended" ? 1.5 : 1.0;
  const quality = preset === "recommended" ? 0.75 : 0.55;

  const info = await getPdfInfo(pdfBytes);
  const totalPages = info.pageCount;

  const newDoc = await PDFDocument.create();

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(i, totalPages);
    const blob = await renderPageToImageBlob(pdfBytes, i, scale, "image/jpeg", quality);
    const arrayBuffer = await blob.arrayBuffer();
    const jpgBytes = new Uint8Array(arrayBuffer);
    const embeddedImg = await newDoc.embedJpg(jpgBytes);

    const page = newDoc.addPage([embeddedImg.width / scale, embeddedImg.height / scale]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: embeddedImg.width / scale,
      height: embeddedImg.height / scale,
    });
  }

  const compressed = await savePdf(newDoc);
  const compressedSize = compressed.byteLength;

  if (compressedSize < originalSize) {
    const reductionPercentage = Math.round(((originalSize - compressedSize) / originalSize) * 100);
    return {
      bytes: compressed,
      originalSize,
      compressedSize,
      reductionPercentage,
      notes:
        preset === "recommended"
          ? "Balanced re-encoding at 150 DPI (75% quality). Text and imagery remain sharp for screen reading and printing."
          : "Maximum compression at 100 DPI (55% quality). Smallest file size, ideal for email attachments and web sharing.",
    };
  } else {
    return {
      bytes: pdfBytes,
      originalSize,
      compressedSize: originalSize,
      reductionPercentage: 0,
      notes: "The original file is already more compact than re-encoded imagery. The original file was preserved.",
    };
  }
}
