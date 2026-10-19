import { renderTableToPdf, TableRenderOptions } from "./table-renderer";

export interface CsvToPdfOptions extends TableRenderOptions {}

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/)[0] || "";
  const counts: Record<string, number> = { ",": 0, ";": 0, "\t": 0, "|": 0 };
  for (const ch of firstLine) if (counts[ch] !== undefined) counts[ch]++;
  let best = ",";
  let max = 0;
  for (const k in counts) if (counts[k] > max) { max = counts[k]; best = k; }
  return max > 0 ? best : ",";
}

function parseCsv(text: string, delim: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === delim) { row.push(field); field = ""; }
      else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (ch === "\r") { /* skip */ }
      else field += ch;
    }
  }
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/**
 * Detects header: first row non-numeric while later rows contain numbers.
 */
function detectHeader(rows: string[][]): boolean {
  if (rows.length < 2) return false;
  const first = rows[0];
  const rest = rows.slice(1, Math.min(rows.length, 6));
  const firstNonNumeric = first.every((c) => isNaN(Number(c.trim().replace(/,/g, ""))) || c.trim() === "");
  const laterHasNumbers = rest.some((r) => r.some((c) => !isNaN(Number(c.trim().replace(/,/g, ""))) && c.trim() !== ""));
  return firstNonNumeric && laterHasNumbers;
}

export async function csvToPdf(
  csvText: string,
  options: CsvToPdfOptions = {}
): Promise<Uint8Array> {
  const delim = detectDelimiter(csvText);
  const rows = parseCsv(csvText, delim);
  if (rows.length === 0) throw new Error("Empty CSV.");
  const hasHeader = options.hasHeader !== undefined ? options.hasHeader : detectHeader(rows);
  return await renderTableToPdf(rows, { ...options, hasHeader });
}

export async function csvFileToPdf(file: File, options: CsvToPdfOptions = {}): Promise<Uint8Array> {
  const text = await file.text();
  return await csvToPdf(text, options);
}