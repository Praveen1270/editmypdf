import * as XLSX from "xlsx";
import { renderTableToPdf, TableRenderOptions } from "./table-renderer";

export interface ExcelToPdfOptions extends TableRenderOptions {
  sheets?: string[]; // sheet names to include; default all
  fitToWidth?: boolean;
}

/**
 * Converts an Excel workbook to a PDF (one table per sheet).
 */
export async function excelToPdf(
  file: File,
  options: ExcelToPdfOptions = {}
): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheetNames = options.sheets && options.sheets.length ? options.sheets : wb.SheetNames;

  // Build a combined rows array with sheet title separators
  const allRows: string[][] = [];
  for (const name of sheetNames) {
    const ws = wb.Sheets[name];
    if (!ws) continue;
    if (allRows.length > 0) allRows.push([]);
    allRows.push([`Sheet: ${name}`]);
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    for (const r of rows) {
      allRows.push((r as any[]).map((c) => (c === null || c === undefined ? "" : String(c))));
    }
  }
  if (allRows.length === 0) throw new Error("Workbook is empty.");

  // Detect header per sheet is hard; treat first row of each sheet as header (sheet_to_json with header:1 keeps first row)
  return await renderTableToPdf(allRows, { ...options, hasHeader: false, title: options.title || file.name });
}