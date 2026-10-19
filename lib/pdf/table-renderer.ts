import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface TableRenderOptions {
  title?: string;
  pageSize?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  fitToWidth?: boolean;
  repeatHeader?: boolean;
  gridlines?: boolean;
  fontSize?: number;
  hasHeader?: boolean;
}

const PAGE_SIZES = { a4: { w: 595.28, h: 841.89 }, letter: { w: 612, h: 792 } };

/**
 * Renders a 2D grid of cells into a paginated PDF.
 */
export async function renderTableToPdf(
  rows: string[][],
  options: TableRenderOptions = {}
): Promise<Uint8Array> {
  const {
    title,
    pageSize = "a4",
    orientation = "portrait",
    fitToWidth = true,
    repeatHeader = true,
    gridlines = true,
    fontSize = 9,
    hasHeader = true,
  } = options;

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let base = PAGE_SIZES[pageSize];
  let pw = base.w, ph = base.h;
  if (orientation === "landscape") [pw, ph] = [ph, pw];

  const margin = 40;
  const usableW = pw - 2 * margin;

  const colCount = rows.reduce((m, r) => Math.max(m, r.length), 0);
  // normalize rows
  const normRows = rows.map((r) => {
    const out = [...r];
    while (out.length < colCount) out.push("");
    return out;
  });

  // compute column widths based on content (char count), capped
  const colWidths = new Array(colCount).fill(0);
  for (const r of normRows) {
    for (let c = 0; c < colCount; c++) {
      const len = Math.min(30, (r[c] || "").length);
      colWidths[c] = Math.max(colWidths[c], len);
    }
  }
  const totalChars = colWidths.reduce((s, w) => s + Math.max(4, w), 0);
  let widths = colWidths.map((w) => (Math.max(4, w) / totalChars) * usableW);
  if (fitToWidth) {
    // already fits
  } else {
    // allow overflow by scaling? keep as is
  }
  // cap min width
  widths = widths.map((w) => Math.max(30, w));

  const headerRow = hasHeader && normRows.length > 0 ? normRows[0] : null;
  const bodyRows = hasHeader ? normRows.slice(1) : normRows;

  const rowHeight = fontSize + 6;
  let y = ph - margin;

  const drawHeader = () => {
    if (!headerRow) return;
    // header bg
    page.drawRectangle({ x: margin, y: y - rowHeight + 2, width: usableW, height: rowHeight, color: rgb(0.85, 0.85, 0.85) });
    let x = margin;
    for (let c = 0; c < colCount; c++) {
      page.drawText(String(headerRow[c] ?? "").slice(0, 40), { x: x + 3, y: y - fontSize, size: fontSize, font: bold, color: rgb(0, 0, 0) });
      if (gridlines) {
        page.drawRectangle({ x, y: y - rowHeight + 2, width: widths[c], height: rowHeight, borderColor: rgb(0.6, 0.6, 0.6), borderWidth: 0.5 });
      }
      x += widths[c];
    }
    y -= rowHeight;
  };

  let page = doc.addPage([pw, ph]);
  y = ph - margin;
  if (title) {
    page.drawText(title, { x: margin, y, size: 12, font: bold, color: rgb(0, 0, 0) });
    y -= 18;
  }
  drawHeader();

  for (const row of bodyRows) {
    if (y < margin + rowHeight) {
      page = doc.addPage([pw, ph]);
      y = ph - margin;
      if (repeatHeader) drawHeader();
    }
    let x = margin;
    for (let c = 0; c < colCount; c++) {
      const val = String(row[c] ?? "").slice(0, 40);
      page.drawText(val, { x: x + 3, y: y - fontSize, size: fontSize, font, color: rgb(0, 0, 0) });
      if (gridlines) {
        page.drawRectangle({ x, y: y - rowHeight + 2, width: widths[c], height: rowHeight, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 0.5 });
      }
      x += widths[c];
    }
    y -= rowHeight;
  }

  return await doc.save({ useObjectStreams: true });
}