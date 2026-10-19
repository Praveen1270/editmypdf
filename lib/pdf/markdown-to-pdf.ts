import MarkdownIt from "markdown-it";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface MarkdownToPdfOptions {
  title?: string;
  fontSize?: number;
  pageSize?: "a4" | "letter";
  theme?: "github" | "serif" | "compact";
  margin?: number;
}

const PAGE = { a4: { w: 595.28, h: 841.89 }, letter: { w: 612, h: 792 } };

/**
 * Renders Markdown to a paginated PDF using pdf-lib.
 */
export async function markdownToPdf(
  md: string,
  options: MarkdownToPdfOptions = {}
): Promise<Uint8Array> {
  const { title, fontSize = 11, pageSize = "a4", margin = 50 } = options;

  const mdParser = new MarkdownIt({ html: false, breaks: true, linkify: true });
  const tokens = mdParser.parse(md, {});

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const base = PAGE[pageSize];
  const pw = base.w, ph = base.h;
  const usableW = pw - 2 * margin;

  let page = doc.addPage([pw, ph]);
  let y = ph - margin;

  const newPage = () => {
    page = doc.addPage([pw, ph]);
    y = ph - margin;
  };
  const ensure = (h: number) => {
    if (y - h < margin) newPage();
  };

  const drawText = (text: string, x: number, size: number, f: any, color = rgb(0, 0, 0), indent = 0) => {
    const words = text.split(/\s+/);
    let line = "";
    const lineHeight = size + 4;
    const startX = x + indent;
    const maxW = usableW - indent;
    const flush = (ln: string) => {
      if (!ln.trim()) return;
      ensure(lineHeight);
      page.drawText(ln, { x: startX, y: y - size, size, font: f, color });
      y -= lineHeight;
    };
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (f.widthOfTextAtSize(test, size) > maxW && line) {
        flush(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) flush(line);
  };

  // Inline token rendering to plain text (strip inline markup to text)
  const inlineText = (tok: any): string => {
    if (tok.content) return tok.content;
    if (tok.children) return tok.children.map(inlineText).join("");
    return "";
  };

  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.type === "heading_open") {
      const level = parseInt(t.tag.slice(1)) || 1;
      const size = Math.max(12, 20 - (level - 1) * 2);
      const next = tokens[i + 1];
      const text = next ? inlineText(next) : "";
      ensure(size + 8);
      y -= 4;
      drawText(text, margin, size, bold);
      y -= 4;
      i += 3; // open, inline, close
      continue;
    }
    if (t.type === "paragraph_open") {
      const next = tokens[i + 1];
      const text = next ? inlineText(next) : "";
      if (text.trim()) drawText(text, margin, fontSize, font);
      y -= 4;
      i += 3;
      continue;
    }
    if (t.type === "code_block" || t.type === "fence") {
      const code = t.content || "";
      const lines = code.split("\n");
      for (const line of lines) {
        ensure(fontSize + 2);
        page.drawRectangle({ x: margin, y: y - fontSize - 2, width: usableW, height: fontSize + 4, color: rgb(0.95, 0.95, 0.95) });
        page.drawText(line || " ", { x: margin + 4, y: y - fontSize, size: fontSize - 1, font: mono, color: rgb(0.2, 0.2, 0.2) });
        y -= fontSize + 2;
      }
      y -= 6;
      i++;
      continue;
    }
    if (t.type === "bullet_list_open" || t.type === "ordered_list_open") {
      const ordered = t.type === "ordered_list_open";
      // collect list items until close
      let j = i + 1;
      let itemNum = 1;
      while (j < tokens.length && tokens[j].type !== "bullet_list_close" && tokens[j].type !== "ordered_list_close") {
        if (tokens[j].type === "list_item_open") {
          // find inline
          let k = j + 1;
          let itemText = "";
          while (k < tokens.length && tokens[k].type !== "list_item_close") {
            if (tokens[k].type === "paragraph_open") {
              const inl = tokens[k + 1];
              itemText += (inl ? inlineText(inl) : "") + " ";
              k += 3;
            } else if (tokens[k].type === "inline") {
              itemText += tokens[k].content + " ";
              k++;
            } else {
              k++;
            }
          }
          const bullet = ordered ? `${itemNum}. ` : "• ";
          drawText(bullet + itemText.trim(), margin, fontSize, font, rgb(0, 0, 0), 0);
          // indent continuation handled by drawText using margin; redo with indent
          // (above draws at margin; for nested, keep simple)
          if (ordered) itemNum++;
          j = k + 1;
        } else {
          j++;
        }
      }
      y -= 4;
      // skip to close
      while (i < tokens.length && tokens[i].type !== "bullet_list_close" && tokens[i].type !== "ordered_list_close") i++;
      i++; // skip close
      continue;
    }
    if (t.type === "blockquote_open") {
      // collect until close
      let j = i + 1;
      let quoteText = "";
      while (j < tokens.length && tokens[j].type !== "blockquote_close") {
        if (tokens[j].type === "paragraph_open") {
          const inl = tokens[j + 1];
          quoteText += (inl ? inlineText(inl) : "") + "\n";
          j += 3;
        } else if (tokens[j].type === "inline") {
          quoteText += tokens[j].content + "\n";
          j++;
        } else {
          j++;
        }
      }
      // draw with left bar
      const lines = quoteText.trim().split("\n");
      for (const ln of lines) {
        if (!ln.trim()) continue;
        // measure
        drawText(ln, margin + 12, fontSize, italic, rgb(0.3, 0.3, 0.3));
      }
      // draw vertical bar (approx)
      // skip precise; just spacing
      y -= 4;
      while (i < tokens.length && tokens[i].type !== "blockquote_close") i++;
      i++;
      continue;
    }
    if (t.type === "hr") {
      ensure(6);
      page.drawLine({ start: { x: margin, y }, end: { x: pw - margin, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
      y -= 8;
      i++;
      continue;
    }
    if (t.type === "table_open") {
      // collect rows
      const tableRows: string[][] = [];
      let j = i + 1;
      while (j < tokens.length && tokens[j].type !== "table_close") {
        if (tokens[j].type === "tr_open") {
          const cells: string[] = [];
          let k = j + 1;
          while (k < tokens.length && tokens[k].type !== "tr_close") {
            if (tokens[k].type === "th_open" || tokens[k].type === "td_open") {
              const inl = tokens[k + 1];
              cells.push(inl ? inlineText(inl) : "");
              k += 3;
            } else {
              k++;
            }
          }
          tableRows.push(cells);
          // advance j to tr_close
          while (j < tokens.length && tokens[j].type !== "tr_close") j++;
          j++; // skip tr_close
        } else {
          j++;
        }
      }
      // render table simply
      if (tableRows.length > 0) {
        const colCount = tableRows.reduce((m, r) => Math.max(m, r.length), 0);
        const colW = usableW / colCount;
        const rh = fontSize + 4;
        // header
        if (tableRows.length > 0) {
          let x = margin;
          page.drawRectangle({ x: margin, y: y - rh + 2, width: usableW, height: rh, color: rgb(0.88, 0.88, 0.88) });
          for (let c = 0; c < colCount; c++) {
            page.drawText(String(tableRows[0][c] ?? "").slice(0, 30), { x: x + 3, y: y - fontSize, size: fontSize, font: bold, color: rgb(0, 0, 0) });
            page.drawRectangle({ x, y: y - rh + 2, width: colW, height: rh, borderColor: rgb(0.6, 0.6, 0.6), borderWidth: 0.5 });
            x += colW;
          }
          y -= rh;
        }
        for (let r = 1; r < tableRows.length; r++) {
          if (y < margin + rh) newPage();
          let x = margin;
          for (let c = 0; c < colCount; c++) {
            page.drawText(String(tableRows[r][c] ?? "").slice(0, 30), { x: x + 3, y: y - fontSize, size: fontSize, font, color: rgb(0, 0, 0) });
            page.drawRectangle({ x, y: y - rh + 2, width: colW, height: rh, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 0.5 });
            x += colW;
          }
          y -= rh;
        }
        y -= 6;
      }
      while (i < tokens.length && tokens[i].type !== "table_close") i++;
      i++;
      continue;
    }
    i++;
  }

  if (title) {
    // prepend title on first page? We'll just ensure metadata
  }

  return await doc.save({ useObjectStreams: true });
}