import { getPdfJs } from "./pdf-loader";

export async function pdfToMarkdown(pdfBytes: Uint8Array): Promise<string> {
  const pdfjs = await getPdfJs();
  const task = pdfjs.getDocument({ data: pdfBytes.slice() });
  const doc = await task.promise;
  const out: string[] = [];
  out.push("# Document");
  out.push("");
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const items = content.items as any[];
    const lines: { text: string; size: number; y: number }[] = [];
    let current: { text: string; size: number; y: number } | null = null;
    const sorted = [...items].sort((a, b) => {
      const ay = a.transform[5], by = b.transform[5];
      if (Math.abs(ay - by) > 3) return by - ay;
      return a.transform[4] - b.transform[4];
    });
    for (const item of sorted) {
      const y = item.transform[5];
      const size = Math.abs(item.transform[0]) || 12;
      const str = item.str || "";
      if (!current || Math.abs(current.y - y) > 3) {
        if (current) lines.push({ text: current.text, size: current.size, y: current.y });
        current = { text: str, size, y };
      } else {
        current.text += " " + str;
        if (size > current.size) current.size = size;
      }
    }
    if (current) lines.push({ text: current.text, size: current.size, y: current.y });

    out.push(`## Page ${p}`);
    out.push("");
    for (const ln of lines) {
      const t = ln.text.trim();
      if (!t) continue;
      if (ln.size >= 16) out.push(`### ${t}`);
      else if (ln.size >= 13) out.push(`**${t}**`);
      else out.push(t);
      out.push("");
    }
  }
  await doc.destroy();
  return out.join("\n");
}
