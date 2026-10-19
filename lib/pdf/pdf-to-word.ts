import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { getPdfJs } from "./pdf-loader";

export interface PdfToWordOptions {
  mode?: "fidelity" | "flow";
}

/**
 * Converts a PDF's text layer into a .docx file.
 */
export async function pdfToWord(
  pdfBytes: Uint8Array,
  options: PdfToWordOptions = {}
): Promise<Uint8Array> {
  const { mode = "flow" } = options;
  const pdfjs = await getPdfJs();
  const task = pdfjs.getDocument({ data: pdfBytes.slice() });
  const doc = await task.promise;
  const totalPages = doc.numPages;

  const paragraphs: Paragraph[] = [];

  for (let p = 1; p <= totalPages; p++) {
    const page = await doc.getPage(p);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    // sort by y desc then x
    const sorted = [...items].sort((a, b) => {
      const ay = a.transform[5], by = b.transform[5];
      if (Math.abs(ay - by) > 3) return by - ay;
      return a.transform[4] - b.transform[4];
    });

    let lines: { text: string; size: number; bold: boolean }[] = [];
    let currentLine = "";
    let currentSize = 12;
    let currentBold = false;
    let lastY: number | null = null;

    const flushLine = () => {
      if (currentLine.trim()) {
        lines.push({ text: currentLine.trim(), size: currentSize, bold: currentBold });
      }
      currentLine = "";
    };

    for (const item of sorted) {
      const y = item.transform[5];
      const size = Math.abs(item.transform[0]) || 12;
      const bold = (item.fontName || "").toLowerCase().includes("bold");
      if (lastY !== null && Math.abs(y - lastY) > 3) flushLine();
      currentLine += (item.str || "") + " ";
      currentSize = size;
      currentBold = bold;
      lastY = y;
    }
    flushLine();

    // Group lines into paragraphs (merge if same size and close)
    for (const ln of lines) {
      const size = ln.size;
      let heading: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
      if (size >= 18) heading = HeadingLevel.HEADING_1;
      else if (size >= 15) heading = HeadingLevel.HEADING_2;
      else if (size >= 13) heading = HeadingLevel.HEADING_3;

      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: ln.text, bold: ln.bold, size: Math.round(size * 2) })],
          heading,
          spacing: { after: 120 },
        })
      );
    }

    // page break between pages (optional)
    if (p < totalPages) {
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: "", break: 1 })], pageBreakBefore: false }));
    }
  }

  await doc.destroy();

  const document = new Document({ sections: [{ children: paragraphs }] });
  const buffer = await Packer.toBuffer(document);
  return new Uint8Array(buffer);
}