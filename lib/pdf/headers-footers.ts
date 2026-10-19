import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface HeaderFooterSlots {
  headerLeft?: string;
  headerCenter?: string;
  headerRight?: string;
  footerLeft?: string;
  footerCenter?: string;
  footerRight?: string;
}

export interface HeaderFooterOptions {
  slots: HeaderFooterSlots;
  fontSize?: number;
  margin?: number;
  color?: string;
  skipFirstPage?: boolean;
  startNumber?: number;
  filename?: string;
  title?: string;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return rgb(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255);
}

function expand(token: string, page: number, total: number, opts: HeaderFooterOptions): string {
  const date = new Date().toLocaleDateString();
  return token
    .replace(/\{page\}/g, String(page))
    .replace(/\{pages\}/g, String(total))
    .replace(/\{date\}/g, date)
    .replace(/\{filename\}/g, opts.filename || "")
    .replace(/\{title\}/g, opts.title || "");
}

export async function addHeadersFooters(
  pdfBytes: Uint8Array,
  options: HeaderFooterOptions
): Promise<Uint8Array> {
  const { slots, fontSize = 9, margin = 30, color = "#444444", skipFirstPage = false, startNumber = 1 } = options;
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const totalPages = doc.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    if (skipFirstPage && i === 0) continue;
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const pageNum = i + startNumber;
    const col = hexToRgb(color);

    const positions = [
      { slot: slots.headerLeft, x: margin, y: height - margin, align: "left" },
      { slot: slots.headerCenter, x: width / 2, y: height - margin, align: "center" },
      { slot: slots.headerRight, x: width - margin, y: height - margin, align: "right" },
      { slot: slots.footerLeft, x: margin, y: margin, align: "left" },
      { slot: slots.footerCenter, x: width / 2, y: margin, align: "center" },
      { slot: slots.footerRight, x: width - margin, y: margin, align: "right" },
    ];

    for (const pos of positions) {
      if (!pos.slot) continue;
      const text = expand(pos.slot, pageNum, totalPages, options);
      const tw = font.widthOfTextAtSize(text, fontSize);
      let x = pos.x;
      if (pos.align === "center") x = pos.x - tw / 2;
      else if (pos.align === "right") x = pos.x - tw;
      page.drawText(text, { x, y: pos.y, size: fontSize, font, color: col });
    }
  }

  return await doc.save({ useObjectStreams: true });
}