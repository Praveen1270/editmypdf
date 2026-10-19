import JSZip from "jszip";
import { htmlToPdf } from "./html-to-pdf";

export interface EbookToPdfOptions {
  pageSize?: "a4" | "letter";
  fontSize?: number;
}

/**
 * Converts an EPUB (DRM-free) to PDF. MOBI/AZW3 not supported in this build.
 */
export async function ebookToPdf(file: File, options: EbookToPdfOptions = {}): Promise<Uint8Array> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".mobi") || name.endsWith(".azw3") || name.endsWith(".azw")) {
    throw new Error("MOBI/AZW3 support is not available in this build. Please convert to EPUB first.");
  }
  const buf = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);

  // find container.xml
  const containerFile = zip.file("META-INF/container.xml");
  if (!containerFile) throw new Error("Invalid EPUB: missing container.xml");
  const containerXml = await containerFile.async("string");
  const opfMatch = containerXml.match(/full-path="([^"]+)"/);
  if (!opfMatch) throw new Error("Invalid EPUB: no rootfile");
  const opfPath = opfMatch[1];
  const opfDir = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1) : "";

  const opfFile = zip.file(opfPath);
  if (!opfFile) throw new Error("Invalid EPUB: missing OPF");
  const opfXml = await opfFile.async("string");

  // manifest: id -> href
  const manifest = new Map<string, string>();
  const itemRegex = /<item[^>]*id="([^"]*)"[^>]*href="([^"]*)"[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(opfXml)) !== null) manifest.set(m[1], m[2]);

  // spine order
  const spineIds: string[] = [];
  const spineRegex = /<itemref[^>]*idref="([^"]*)"[^>]*>/g;
  while ((m = spineRegex.exec(opfXml)) !== null) spineIds.push(m[1]);

  // title
  const titleMatch = opfXml.match(/<dc:title[^>]*>([^<]*)<\/dc:title>/);
  const title = titleMatch ? titleMatch[1] : file.name;

  // concatenate chapters
  let html = `<h1>${escapeHtml(title)}</h1>`;
  for (const id of spineIds) {
    const href = manifest.get(id);
    if (!href) continue;
    const fullPath = opfDir + href;
    const chapFile = zip.file(fullPath);
    if (!chapFile) continue;
    const chapHtml = await chapFile.async("string");
    // strip head/body wrappers, keep body content
    const bodyMatch = chapHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const content = bodyMatch ? bodyMatch[1] : chapHtml;
    html += content;
  }

  return await htmlToPdf(html, { pageSize: options.pageSize || "a4", fontSize: options.fontSize || 11 });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}