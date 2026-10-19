import * as XLSX from "xlsx";
import { getPdfJs } from "./pdf-loader";

export interface PdfToExcelOptions {
  oneSheetPerPage?: boolean;
}

/**
 * Extracts tables from a PDF into an .xlsx workbook.
 * Heuristic: cluster text items by y (rows) and x (columns).
 */
export async function pdfToExcel(
  pdfBytes: Uint8Array,
  options: PdfToExcelOptions = {}
): Promise<Uint8Array> {
  const { oneSheetPerPage = true } = options;
  const pdfjs = await getPdfJs();
  const task = pdfjs.getDocument({ data: pdfBytes.slice() });
  const doc = await task.promise;
  const totalPages = doc.numPages;

  const wb = XLSX.utils.book_new();

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

    // cluster into rows by y (tolerance 4pt)
    const rows: { y: number; cells: { x: number; text: string }[] }[] = [];
    for (const item of sorted) {
      const y = item.transform[5];
      const x = item.transform[4];
      const str = item.str || "";
      if (!str.trim()) continue;
      let row = rows.find((r) => Math.abs(r.y - y) <= 4);
      if (!row) { row = { y, cells: [] }; rows.push(row); }
      row.cells.push({ x, text: str });
    }

    // determine column boundaries by clustering x positions across all rows
    const xs: number[] = [];
    for (const r of rows) for (const c of r.cells) xs.push(c.x);
    xs.sort((a, b) => a - b);
    const colCenters: number[] = [];
    for (const x of xs) {
      if (colCenters.length === 0 || x - colCenters[colCenters.length - 1] > 15) colCenters.push(x);
      else colCenters[colCenters.length - 1] = (colCenters[colCenters.length - 1] + x) / 2;
    }

    // build grid
    const grid: string[][] = rows.map((r) => {
      const out = new Array(colCenters.length).fill("");
      for (const c of r.cells) {
        // find nearest col center
        let best = 0, bestDist = Infinity;
        for (let i = 0; i < colCenters.length; i++) {
          const d = Math.abs(colCenters[i] - c.x);
          if (d < bestDist) { bestDist = d; best = i; }
        }
        out[best] = (out[best] ? out[best] + " " : "") + c.text;
      }
      return out;
    });

    // remove empty rows
    const filtered = grid.filter((r) => r.some((c) => c.trim() !== ""));
    if (filtered.length === 0) continue;

    const ws = XLSX.utils.aoa_to_sheet(filtered);
    const sheetName = oneSheetPerPage ? `Page ${p}` : `Sheet${p}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  }

  if (wb.SheetNames.length === 0) throw new Error("No text found in PDF.");

  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  await doc.destroy();
  return new Uint8Array(out);
}