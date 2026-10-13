import { PDFDocument, degrees } from "pdf-lib";

export interface PageRotationMap {
  [pageIndex: number]: number; // additional degrees (0, 90, 180, 270)
}

export async function rotatePdf(
  pdfBytes: Uint8Array,
  rotations: PageRotationMap
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = doc.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const additionalAngle = rotations[i] || 0;
    if (additionalAngle !== 0) {
      const page = doc.getPage(i);
      const currentAngle = page.getRotation().angle;
      const newAngle = (currentAngle + additionalAngle) % 360;
      page.setRotation(degrees(newAngle));
    }
  }

  return await doc.save();
}
