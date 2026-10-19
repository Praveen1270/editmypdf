import { getPdfJs } from "./pdf-loader";

export interface PdfToHtmlOptions {
  mode?: "positioned" | "reflowable";
  includeImages?: boolean;
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
  const pdfjs = await getPdfJs();
  const task = pdfjs.getDocument({ data: pdfBytes.slice() });
  const doc = await task.promise;
  const totalPages = doc.numPages;

  let body = "";

  if (mode === "positioned") {
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
  } else {
    // reflowable: group into lines/paragraphs
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
      let lines: string[] = [];
      let currentLine = "";
      let lastY: number | null = null;
      for (const item of sorted) {
        const y = item.transform[5];
        if (lastY !== null && Math.abs(y - lastY) > 3) {
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = "";
        }
        currentLine += (item.str || "") + " ";
        lastY = y;
      }
      if (currentLine.trim()) lines.push(currentLine.trim());
      body += `<section class="page" data-page="${p}">\n`;
      for (const line of lines) {
        body += `  <p>${escapeHtml(line)}</p>\n`;
      }
      body += `</section>\n`;
    }
  }

  await doc.destroy();

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