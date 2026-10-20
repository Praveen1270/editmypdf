import { PDFDocument } from "pdf-lib";

export async function removePdfPages(pdfBytes: Uint8Array, pagesToRemove: number[]): Promise<Uint8Array> {
  const src = await PDFDocument.load(pdfBytes);
  const total = src.getPageCount();
  const removeSet = new Set(pagesToRemove);
  const keep: number[] = [];
  for (let i = 0; i < total; i++) {
    if (!removeSet.has(i)) keep.push(i);
  }
  if (keep.length === 0) {
    throw new Error("Cannot remove every page; at least one page must remain.");
  }
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, keep);
  copied.forEach((p) => out.addPage(p));
  return out.save();
}
