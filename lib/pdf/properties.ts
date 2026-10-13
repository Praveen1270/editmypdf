import { PDFDocument } from "pdf-lib";
import { formatFileSize } from "@/lib/utils";

export interface PageDimensionInfo {
  pageNumber: number;
  widthPt: number;
  heightPt: number;
  widthMm: number;
  heightMm: number;
  widthIn: number;
  heightIn: number;
  formatName: string;
  orientation: "Portrait" | "Landscape" | "Square";
}

export interface DocumentPropertiesReport {
  filename: string;
  filesize: number;
  filesizeFormatted: string;
  pageCount: number;
  isEncrypted: boolean;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    producer?: string;
    creator?: string;
    creationDate?: string;
    modificationDate?: string;
  };
  pages: PageDimensionInfo[];
  plainTextReport: string;
}

function detectFormatName(w: number, h: number): string {
  const min = Math.min(w, h);
  const max = Math.max(w, h);

  // A4: 595 x 842
  if (Math.abs(min - 595.28) < 15 && Math.abs(max - 841.89) < 15) return "A4";
  // Letter: 612 x 792
  if (Math.abs(min - 612.0) < 15 && Math.abs(max - 792.0) < 15) return "US Letter";
  // Legal: 612 x 1008
  if (Math.abs(min - 612.0) < 15 && Math.abs(max - 1008.0) < 15) return "US Legal";
  // A3: 842 x 1191
  if (Math.abs(min - 841.89) < 15 && Math.abs(max - 1190.55) < 15) return "A3";
  // A5: 420 x 595
  if (Math.abs(min - 419.53) < 15 && Math.abs(max - 595.28) < 15) return "A5";

  return "Custom Size";
}

export async function inspectPdfProperties(
  pdfBytes: Uint8Array,
  filename: string
): Promise<DocumentPropertiesReport> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = doc.getPageCount();

  const pages: PageDimensionInfo[] = [];

  for (let i = 0; i < pageCount; i++) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();

    const wMm = Math.round((width * 25.4) / 72);
    const hMm = Math.round((height * 25.4) / 72);
    const wIn = Math.round((width / 72) * 100) / 100;
    const hIn = Math.round((height / 72) * 100) / 100;

    let orientation: "Portrait" | "Landscape" | "Square" = "Portrait";
    if (Math.abs(width - height) < 2) orientation = "Square";
    else if (width > height) orientation = "Landscape";

    pages.push({
      pageNumber: i + 1,
      widthPt: Math.round(width * 10) / 10,
      heightPt: Math.round(height * 10) / 10,
      widthMm: wMm,
      heightMm: hMm,
      widthIn: wIn,
      heightIn: hIn,
      formatName: detectFormatName(width, height),
      orientation,
    });
  }

  const rawKeywords = doc.getKeywords();
  let keywordsStr = "";
  if (Array.isArray(rawKeywords)) keywordsStr = rawKeywords.join(", ");
  else if (typeof rawKeywords === "string") keywordsStr = rawKeywords;

  const metadata = {
    title: doc.getTitle() || undefined,
    author: doc.getAuthor() || undefined,
    subject: doc.getSubject() || undefined,
    keywords: keywordsStr || undefined,
    producer: doc.getProducer() || undefined,
    creator: doc.getCreator() || undefined,
    creationDate: doc.getCreationDate()?.toISOString(),
    modificationDate: doc.getModificationDate()?.toISOString(),
  };

  // Compile plain text audit report
  let report = "=====================================================\n";
  report += "           PDFKIT DOCUMENT PROPERTIES AUDIT           \n";
  report += "=====================================================\n\n";
  report += `Filename:            ${filename}\n`;
  report += `File Size:           ${formatFileSize(pdfBytes.byteLength)} (${pdfBytes.byteLength.toLocaleString()} bytes)\n`;
  report += `Total Page Count:    ${pageCount}\n`;
  report += `Audit Timestamp:     ${new Date().toISOString()}\n\n`;

  report += "----------------- DOCUMENT METADATA -----------------\n";
  report += `Title:               ${metadata.title || "(None)"}\n`;
  report += `Author:              ${metadata.author || "(None)"}\n`;
  report += `Subject:             ${metadata.subject || "(None)"}\n`;
  report += `Keywords:            ${metadata.keywords || "(None)"}\n`;
  report += `Creator:             ${metadata.creator || "(None)"}\n`;
  report += `Producer:            ${metadata.producer || "(None)"}\n`;
  report += `Creation Date:       ${metadata.creationDate || "(None)"}\n`;
  report += `Modification Date:   ${metadata.modificationDate || "(None)"}\n\n`;

  report += "----------------- PAGE SPECIFICATIONS ---------------\n";
  pages.forEach((p) => {
    report += `Page ${p.pageNumber.toString().padStart(3, " ")}: ${p.formatName} (${p.orientation}) — ${p.widthPt} x ${p.heightPt} pt [${p.widthMm} x ${p.heightMm} mm / ${p.widthIn} x ${p.heightIn} in]\n`;
  });
  report += "\n=====================================================\n";
  report += "Generated locally with PDFKit (Zero Server Uploads)\n";

  return {
    filename,
    filesize: pdfBytes.byteLength,
    filesizeFormatted: formatFileSize(pdfBytes.byteLength),
    pageCount,
    isEncrypted: false,
    metadata,
    pages,
    plainTextReport: report,
  };
}
