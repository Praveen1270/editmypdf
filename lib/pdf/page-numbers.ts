import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type PositionVertical = "top" | "bottom";
export type AlignmentHorizontal = "left" | "center" | "right";

export interface PageNumberOptions {
  position: PositionVertical;
  alignment: AlignmentHorizontal;
  format: string; // e.g. "Page {n}", "{n} of {total}", "{n}"
  startNumber: number;
  fontSize: number;
  margin: number;
  skipFirstPage: boolean;
}

export async function addPageNumbers(
  pdfBytes: Uint8Array,
  options: PageNumberOptions
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const totalPages = doc.getPageCount();

  const countForCalculation = options.skipFirstPage ? Math.max(1, totalPages - 1) : totalPages;

  for (let i = 0; i < totalPages; i++) {
    if (options.skipFirstPage && i === 0) {
      continue;
    }

    const page = doc.getPage(i);
    const { width, height } = page.getSize();

    const currentNum = options.skipFirstPage
      ? i - 1 + options.startNumber
      : i + options.startNumber;

    const formattedText = options.format
      .replace(/\{n\}/g, String(currentNum))
      .replace(/\{total\}/g, String(countForCalculation));

    const textWidth = font.widthOfTextAtSize(formattedText, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    // Compute horizontal position
    let x: number;
    if (options.alignment === "left") {
      x = options.margin;
    } else if (options.alignment === "center") {
      x = (width - textWidth) / 2;
    } else {
      x = width - options.margin - textWidth;
    }

    // Compute vertical position
    let y: number;
    if (options.position === "top") {
      y = height - options.margin - textHeight;
    } else {
      y = options.margin;
    }

    page.drawText(formattedText, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  return await doc.save();
}
