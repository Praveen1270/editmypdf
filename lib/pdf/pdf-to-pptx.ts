import { getPdfJs } from "./pdf-loader";

async function loadPptxGenJS() {
  const mod = await import(/* webpackIgnore: true */ "pptxgenjs");
  return mod.default || mod;
}

export interface PdfToPptxOptions {
  includeNotes?: boolean;
}

export async function pdfToPptx(pdfBytes: Uint8Array, options: PdfToPptxOptions = {}): Promise<Uint8Array> {
  const pdfjs = await getPdfJs();
  const task = pdfjs.getDocument({ data: pdfBytes.slice() });
  const doc = await task.promise;
  const totalPages = doc.numPages;

  const PptxGenJS = await loadPptxGenJS();
  const pptx = new PptxGenJS();

  for (let p = 1; p <= totalPages; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 1 });
    const slide = pptx.addSlide();
    // slide size follows page aspect ratio
    slide.background = { color: "FFFFFF" };

    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    // group into lines
    const lines: { text: string; x: number; y: number; size: number }[] = [];
    let current: { text: string; x: number; y: number; size: number } | null = null;
    const sorted = [...items].sort((a, b) => {
      const ay = a.transform[5], by = b.transform[5];
      if (Math.abs(ay - by) > 3) return by - ay;
      return a.transform[4] - b.transform[4];
    });
    for (const item of sorted) {
      const x = item.transform[4];
      const y = viewport.height - item.transform[5];
      const size = Math.abs(item.transform[0]) || 12;
      if (!current || Math.abs(current.y - y) > 3) {
        if (current) lines.push(current);
        current = { text: item.str || "", x, y, size };
      } else {
        current.text += " " + (item.str || "");
      }
    }
    if (current) lines.push(current);

    // scale from PDF points to slide inches (slide is 10" wide default)
    const slideW = 10;
    const slideH = (viewport.height / viewport.width) * slideW;
    pptx.defineLayout({ name: `L${p}`, width: slideW, height: slideH });
    // can't change layout per slide easily; use default and position proportionally
    const sx = slideW / viewport.width;
    const sy = slideH / viewport.height;

    for (const ln of lines) {
      if (!ln.text.trim()) continue;
      slide.addText(ln.text.trim(), {
        x: ln.x * sx,
        y: ln.y * sy,
        w: Math.max(1, (viewport.width - ln.x) * sx),
        h: (ln.size + 4) * sy,
        fontSize: Math.max(8, Math.round(ln.size * 0.75)),
        color: "000000",
      });
    }
  }

  const out = await pptx.write({ outputType: "uint8array" });
  await doc.destroy();
  return out as Uint8Array;
}