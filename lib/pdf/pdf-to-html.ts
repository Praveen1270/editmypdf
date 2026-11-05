import { openPdfJs, extractTextLines } from "./core";

export interface PdfToHtmlOptions {
  mode?: "positioned" | "reflowable";
  title?: string;
}

/**
 * Converts a PDF to an HTML document.
 * Positioned mode places absolutely-positioned spans (closest to PDF).
 * Reflowable mode produces semantic HTML from the text layer.
 */
export async function convertPdfToHtml(
  pdfBytes: Uint8Array,
  options: PdfToHtmlOptions = {}
): Promise<string> {
  const { mode = "positioned", title = "Converted Document" } = options;

  let body = "";

  if (mode === "positioned") {
    const doc = await openPdfJs(pdfBytes);
    const totalPages = doc.numPages;

    for (let p = 1; p <= totalPages; p++) {
      const page = await doc.getPage(p);
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent();
      body += `<section class="page" style="position:relative;width:${viewport.width}px;height:${viewport.height}px;margin:0 auto 24px;border:1px solid #ccc;">\n`;
      for (const item of textContent.items as any[]) {
        const tx = item.transform;
        const x = tx[4];
        const y = viewport.height - tx[5];
        const size = Math.abs(tx[0]) || 12;
        const str = escapeHtml(item.str || "");
        body += `<span style="position:absolute;left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;font-size:${size.toFixed(1)}px;white-space:pre;">${str}</span>\n`;
      }
      body += `</section>\n`;
    }
    await doc.destroy();
  } else {
    const pages = await extractTextLines(pdfBytes);
    for (let p = 1; p <= pages.length; p++) {
      body += `<section class="page" data-page="${p}">\n`;
      for (const line of pages[p - 1]) {
        body += `  <p>${escapeHtml(line)}</p>\n`;
      }
      body += `</section>\n`;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #222; line-height: 1.5; }
  section.page { margin-bottom: 32px; }
  p { margin: 0 0 8px; }
  @media print { section.page { page-break-after: always; } }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}