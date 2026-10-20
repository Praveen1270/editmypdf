import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function powerpointToPdf(pptxBytes: Uint8Array): Promise<Uint8Array> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(pptxBytes);
  const slideFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/i.test(n))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/)![1], 10);
      const nb = parseInt(b.match(/slide(\d+)/)![1], 10);
      return na - nb;
    });

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pageW = 720, pageH = 540;

  for (const sf of slideFiles) {
    const xml = await zip.file(sf)!.async("string");
    // extract text from <a:t> tags
    const texts: string[] = [];
    const regex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
    let m;
    while ((m = regex.exec(xml)) !== null) {
      const t = m[1]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      if (t.trim()) texts.push(t);
    }
    const page = doc.addPage([pageW, pageH]);
    let y = pageH - 40;
    page.drawText(`Slide ${slideFiles.indexOf(sf) + 1}`, { x: 40, y, size: 16, font, color: rgb(0.2, 0.2, 0.2) });
    y -= 30;
    for (const t of texts) {
      if (y < 40) break;
      page.drawText(t, { x: 40, y, size: 12, font, color: rgb(0, 0, 0), maxWidth: pageW - 80 });
      y -= 18;
    }
  }
  if (slideFiles.length === 0) {
    const page = doc.addPage([pageW, pageH]);
    page.drawText("No slides found in presentation.", { x: 40, y: pageH - 40, size: 12, font });
  }
  return doc.save();
}
