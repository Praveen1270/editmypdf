import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface HtmlToPdfOptions {
  pageSize?: "a4" | "letter";
  fontSize?: number;
  margin?: number;
}

const PAGE = { a4: { w: 595.28, h: 841.89 }, letter: { w: 612, h: 792 } };

function safeFontText(text: string, font: any): string {
  if (!text) return "";
  const normalized = text
    .replace(/[\u2192\u279E\u2794]/g, "->")
    .replace(/[\u2190]/g, "<-")
    .replace(/[\u2194]/g, "<->")
    .replace(/[\u2013]/g, "-")
    .replace(/[\u2014]/g, "--")
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2026]/g, "...")
    .replace(/[\u2022\u25CF\u25CB\u25AA]/g, "*")
    .replace(/[\u00B7]/g, "|")
    .replace(/[\u2713\u2714]/g, "[x]")
    .replace(/[\u2717\u2718]/g, "[ ]");

  let result = "";
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    try {
      font.encodeText(char);
      result += char;
    } catch {
      result += " ";
    }
  }
  return result;
}

/**
 * Converts an HTML string to a paginated PDF by walking the DOM.
 */
export async function htmlToPdf(html: string, options: HtmlToPdfOptions = {}): Promise<Uint8Array> {
  const { pageSize = "a4", fontSize = 11, margin = 50 } = options;
  const base = PAGE[pageSize];
  const pw = base.w, ph = base.h;
  const usableW = pw - 2 * margin;

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const parser = new DOMParser();
  const dom = parser.parseFromString(html, "text/html");

  let page = doc.addPage([pw, ph]);
  let y = ph - margin;

  const newPage = () => { page = doc.addPage([pw, ph]); y = ph - margin; };
  const ensure = (h: number) => { if (y - h < margin) newPage(); };

  const drawWrapped = (text: string, size: number, f: any, color = rgb(0, 0, 0), indent = 0) => {
    const sanitized = safeFontText(text, f);
    const words = sanitized.split(/\s+/);
    let line = "";
    const lh = size + 4;
    const startX = margin + indent;
    const maxW = usableW - indent;
    const flush = (ln: string) => {
      if (!ln.trim()) return;
      ensure(lh);
      const safeLn = safeFontText(ln, f);
      page.drawText(safeLn, { x: startX, y: y - size, size, font: f, color });
      y -= lh;
    };
    for (const w of words) {
      const test = line ? line + " " + w : w;
      let width = 0;
      try {
        width = f.widthOfTextAtSize(test, size);
      } catch {
        const safeTest = safeFontText(test, f);
        width = f.widthOfTextAtSize(safeTest, size);
      }
      if (width > maxW && line) { flush(line); line = w; }
      else line = test;
    }
    if (line) flush(line);
  };

  const walk = (node: Node, ctx: { size: number; font: any; color: any; indent: number }) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = (node.textContent || "").replace(/\s+/g, " ");
      if (txt.trim()) drawWrapped(txt, ctx.size, ctx.font, ctx.color, ctx.indent);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
      const level = parseInt(tag[1]);
      const size = Math.max(12, 20 - (level - 1) * 2);
      y -= 4;
      const txt = el.textContent || "";
      drawWrapped(txt, size, bold, rgb(0, 0, 0), ctx.indent);
      y -= 4;
      return; // don't recurse (text already consumed)
    }
    if (tag === "p") {
      const txt = el.textContent || "";
      drawWrapped(txt, ctx.size, ctx.font, ctx.color, ctx.indent);
      y -= 6;
      return;
    }
    if (tag === "br") { y -= ctx.size + 4; return; }
    if (tag === "hr") {
      ensure(6);
      page.drawLine({ start: { x: margin, y }, end: { x: pw - margin, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
      y -= 8;
      return;
    }
    if (tag === "pre" || tag === "code") {
      const code = el.textContent || "";
      for (const line of code.split("\n")) {
        ensure(ctx.size + 2);
        page.drawRectangle({ x: margin + ctx.indent, y: y - ctx.size - 2, width: usableW - ctx.indent, height: ctx.size + 4, color: rgb(0.95, 0.95, 0.95) });
        page.drawText(safeFontText(line || " ", mono), { x: margin + ctx.indent + 4, y: y - ctx.size, size: ctx.size - 1, font: mono, color: rgb(0.2, 0.2, 0.2) });
        y -= ctx.size + 2;
      }
      y -= 6;
      return;
    }
    if (tag === "ul" || tag === "ol") {
      let idx = 1;
      for (const child of Array.from(el.children)) {
        if (child.tagName.toLowerCase() === "li") {
          const bullet = tag === "ol" ? `${idx}. ` : "• ";
          const txt = child.textContent || "";
          drawWrapped(bullet + txt, ctx.size, ctx.font, ctx.color, ctx.indent + 12);
          y -= 2;
          idx++;
        } else {
          walk(child, ctx);
        }
      }
      y -= 4;
      return;
    }
    if (tag === "blockquote") {
      const prevIndent = ctx.indent;
      ctx.indent += 12;
      for (const child of Array.from(el.childNodes)) walk(child, { ...ctx, font: italic, color: rgb(0.3, 0.3, 0.3) });
      ctx.indent = prevIndent;
      y -= 4;
      return;
    }
    if (tag === "table") {
      const rows: string[][] = [];
      for (const tr of Array.from(el.querySelectorAll("tr"))) {
        const cells: string[] = [];
        for (const td of Array.from(tr.querySelectorAll("th, td"))) {
          cells.push((td.textContent || "").trim());
        }
        rows.push(cells);
      }
      if (rows.length > 0) {
        const colCount = rows.reduce((m, r) => Math.max(m, r.length), 0);
        const colW = usableW / colCount;
        const rh = ctx.size + 4;
        // header
        let x = margin + ctx.indent;
        page.drawRectangle({ x: margin + ctx.indent, y: y - rh + 2, width: usableW - ctx.indent, height: rh, color: rgb(0.88, 0.88, 0.88) });
        for (let c = 0; c < colCount; c++) {
          page.drawText(safeFontText(String(rows[0][c] ?? "").slice(0, 30), bold), { x: x + 3, y: y - ctx.size, size: ctx.size, font: bold, color: rgb(0, 0, 0) });
          page.drawRectangle({ x, y: y - rh + 2, width: colW, height: rh, borderColor: rgb(0.6, 0.6, 0.6), borderWidth: 0.5 });
          x += colW;
        }
        y -= rh;
        for (let r = 1; r < rows.length; r++) {
          if (y < margin + rh) newPage();
          x = margin + ctx.indent;
          for (let c = 0; c < colCount; c++) {
            page.drawText(safeFontText(String(rows[r][c] ?? "").slice(0, 30), font), { x: x + 3, y: y - ctx.size, size: ctx.size, font, color: rgb(0, 0, 0) });
            page.drawRectangle({ x, y: y - rh + 2, width: colW, height: rh, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 0.5 });
            x += colW;
          }
          y -= rh;
        }
        y -= 6;
      }
      return;
    }
    if (tag === "img") {
      // skip images (would need fetch; keep private)
      return;
    }
    // default: recurse
    for (const child of Array.from(el.childNodes)) {
      walk(child, ctx);
    }
  };

  const body = dom.body;
  for (const child of Array.from(body.childNodes)) {
    walk(child, { size: fontSize, font, color: rgb(0, 0, 0), indent: 0 });
  }

  return await doc.save({ useObjectStreams: true });
}