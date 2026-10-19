import { getPdfJs } from "./pdf-loader";
import JSZip from "jszip";

export interface PdfToEpubOptions {
  title?: string;
  author?: string;
  splitEvery?: number; // pages per chapter if no headings
}

/**
 * Converts a PDF to an EPUB file (as Uint8Array zip).
 */
export async function convertPdfToEpub(
  pdfBytes: Uint8Array,
  options: PdfToEpubOptions = {}
): Promise<Uint8Array> {
  const { title = "Converted Book", author = "", splitEvery = 10 } = options;
  const pdfjs = await getPdfJs();
  const task = pdfjs.getDocument({ data: pdfBytes.slice() });
  const doc = await task.promise;
  const totalPages = doc.numPages;

  // Extract text per page
  const pageTexts: string[] = [];
  for (let p = 1; p <= totalPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const text = (tc.items as any[]).map((i) => i.str).join(" ");
    pageTexts.push(text);
  }
  await doc.destroy();

  // Split into chapters
  const chapters: { title: string; body: string }[] = [];
  let current: string[] = [];
  let chapIdx = 1;
  for (let i = 0; i < pageTexts.length; i++) {
    current.push(`<p>${escapeHtml(pageTexts[i])}</p>`);
    if ((i + 1) % splitEvery === 0 || i === pageTexts.length - 1) {
      chapters.push({ title: `Chapter ${chapIdx}`, body: current.join("\n") });
      current = [];
      chapIdx++;
    }
  }

  // Build EPUB zip
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  const metaInf = zip.folder("META-INF")!;
  metaInf.file("container.xml", `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  const oebps = zip.folder("OEBPS")!;
  // nav
  const navItems = chapters.map((c, i) => `<li><a href="chap${i + 1}.xhtml">${escapeHtml(c.title)}</a></li>`).join("");
  oebps.file("nav.xhtml", `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Contents</title></head>
<body><nav epub:type="toc"><h1>Contents</h1><ol>${navItems}</ol></nav></body>
</html>`);

  chapters.forEach((c, i) => {
    oebps.file(`chap${i + 1}.xhtml`, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escapeHtml(c.title)}</title></head>
<body><h1>${escapeHtml(c.title)}</h1>${c.body}</body>
</html>`);
  });

  const manifestItems = chapters
    .map((_, i) => `<item id="chap${i + 1}" href="chap${i + 1}.xhtml" media-type="application/xhtml+xml"/>`)
    .join("\n    ");
  const spineItems = chapters.map((_, i) => `<itemref idref="chap${i + 1}"/>`).join("\n    ");

  oebps.file("content.opf", `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:uuid:${crypto.randomUUID()}</dc:identifier>
    <dc:title>${escapeHtml(title)}</dc:title>
    <dc:creator>${escapeHtml(author)}</dc:creator>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    ${manifestItems}
  </manifest>
  <spine>
    ${spineItems}
  </spine>
</package>`);

  const out = await zip.generateAsync({ type: "uint8array" });
  return out;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}