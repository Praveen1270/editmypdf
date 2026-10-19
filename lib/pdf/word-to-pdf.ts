import mammoth from "mammoth";
import { htmlToPdf } from "./html-to-pdf";

export interface WordToPdfOptions {
  pageSize?: "a4" | "letter";
  fontSize?: number;
}

export async function wordToPdf(file: File, options: WordToPdfOptions = {}): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer: buf });
  const html = result.value || "";
  return await htmlToPdf(html, { pageSize: options.pageSize || "a4", fontSize: options.fontSize || 11 });
}