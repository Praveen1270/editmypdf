import { PDFDocument } from "pdf-lib";

export interface SignPdfOptions {
  pageIndex?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export async function signPdf(
  pdfBytes: Uint8Array,
  signatureImageBytes: Uint8Array,
  imageType: "png" | "jpg",
  options: SignPdfOptions = {}
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const page = doc.getPage(options.pageIndex ?? 0);
  const { width: pageW, height: pageH } = page.getSize();
  const img =
    imageType === "png"
      ? await doc.embedPng(signatureImageBytes)
      : await doc.embedJpg(signatureImageBytes);
  const w = options.width ?? 150;
  const h = options.height ?? (img.height * (w / img.width));
  const x = options.x ?? pageW / 2 - w / 2;
  const y = options.y ?? pageH / 2 - h / 2;
  page.drawImage(img, { x, y, width: w, height: h });
  return doc.save();
}
