import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type Experience = {
  title: string;
  company: string;
  start: string;
  end: string;
  bullets: string[];
};

export type Education = {
  degree: string;
  school: string;
  year: string;
};

export type Project = {
  name: string;
  desc: string;
  tech: string;
};

export type ResumeData = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string;
};

export type ResumeTemplate = "Classic" | "Modern" | "Sidebar" | "Academic CV";

function sanitizeText(raw: string, font: any): string {
  if (!raw) return "";
  const normalized = raw
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

export async function generateResumePdf(
  data: ResumeData,
  template: ResumeTemplate = "Classic",
  order: string[] = ["summary", "experience", "education", "projects", "skills"]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  
  const isSerif = template === "Academic CV";
  const regularFont = isSerif
    ? await doc.embedFont(StandardFonts.TimesRoman)
    : await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = isSerif
    ? await doc.embedFont(StandardFonts.TimesRomanBold)
    : await doc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = isSerif
    ? await doc.embedFont(StandardFonts.TimesRomanItalic)
    : await doc.embedFont(StandardFonts.HelveticaOblique);

  // A4 dimensions: 595.28 x 841.89 points
  const pw = 595.28;
  const ph = 841.89;
  const margin = 40;
  const usableW = pw - margin * 2;

  let page = doc.addPage([pw, ph]);
  let y = ph - margin;

  const newPage = () => {
    page = doc.addPage([pw, ph]);
    y = ph - margin;
  };

  const ensureSpace = (height: number) => {
    if (y - height < margin) {
      newPage();
    }
  };

  const primaryColor =
    template === "Modern"
      ? rgb(0.12, 0.35, 0.85) // Crisp modern blue
      : rgb(0.1, 0.1, 0.1);

  const subtleTextColor = rgb(0.35, 0.35, 0.35);
  const ruleColor = template === "Modern" ? rgb(0.2, 0.4, 0.85) : rgb(0.65, 0.65, 0.65);

  const drawWrappedText = (
    text: string,
    size: number,
    fontObj: any,
    color = rgb(0.1, 0.1, 0.1),
    indent = 0,
    lineGap = 3
  ) => {
    const clean = sanitizeText(text, fontObj);
    const words = clean.split(/\s+/);
    let line = "";
    const startX = margin + indent;
    const maxW = usableW - indent;

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      let width = 0;
      try {
        width = fontObj.widthOfTextAtSize(candidate, size);
      } catch {
        const safeCandidate = sanitizeText(candidate, fontObj);
        width = fontObj.widthOfTextAtSize(safeCandidate, size);
      }

      if (width > maxW && line) {
        ensureSpace(size + lineGap);
        page.drawText(line, { x: startX, y: y - size, size, font: fontObj, color });
        y -= size + lineGap;
        line = word;
      } else {
        line = candidate;
      }
    }

    if (line.trim()) {
      ensureSpace(size + lineGap);
      page.drawText(line, { x: startX, y: y - size, size, font: fontObj, color });
      y -= size + lineGap;
    }
  };

  // --- Header ---
  const nameText = sanitizeText(data.name || "Resume", boldFont);
  const nameSize = template === "Academic CV" ? 20 : 18;
  const nameW = boldFont.widthOfTextAtSize(nameText, nameSize);

  const isCentered = template === "Classic" || template === "Academic CV";
  const nameX = isCentered ? (pw - nameW) / 2 : margin;

  ensureSpace(nameSize + 4);
  page.drawText(nameText, {
    x: nameX,
    y: y - nameSize,
    size: nameSize,
    font: boldFont,
    color: primaryColor,
  });
  y -= nameSize + 5;

  if (data.title) {
    const titleText = sanitizeText(data.title, regularFont);
    const titleSize = 11;
    const titleW = regularFont.widthOfTextAtSize(titleText, titleSize);
    const titleX = isCentered ? (pw - titleW) / 2 : margin;
    ensureSpace(titleSize + 4);
    page.drawText(titleText, {
      x: titleX,
      y: y - titleSize,
      size: titleSize,
      font: italicFont,
      color: subtleTextColor,
    });
    y -= titleSize + 5;
  }

  // Contact line
  const contactParts = [data.email, data.phone, data.location].filter(Boolean);
  if (contactParts.length > 0) {
    const contactLine = sanitizeText(contactParts.join("  |  "), regularFont);
    const cSize = 9.5;
    const cW = regularFont.widthOfTextAtSize(contactLine, cSize);
    const cX = isCentered ? (pw - cW) / 2 : margin;
    ensureSpace(cSize + 3);
    page.drawText(contactLine, {
      x: cX,
      y: y - cSize,
      size: cSize,
      font: regularFont,
      color: subtleTextColor,
    });
    y -= cSize + 4;
  }

  // Links line
  if (data.links) {
    const linksLine = sanitizeText(data.links, regularFont);
    const lSize = 9;
    const lW = regularFont.widthOfTextAtSize(linksLine, lSize);
    const lX = isCentered ? (pw - lW) / 2 : margin;
    ensureSpace(lSize + 4);
    page.drawText(linksLine, {
      x: lX,
      y: y - lSize,
      size: lSize,
      font: regularFont,
      color: subtleTextColor,
    });
    y -= lSize + 6;
  }

  y -= 4;

  // --- Section Renderer Helper ---
  const drawSectionTitle = (title: string) => {
    ensureSpace(24);
    y -= 8;
    const safeTitle = sanitizeText(title.toUpperCase(), boldFont);
    const size = 11;
    page.drawText(safeTitle, {
      x: margin,
      y: y - size,
      size,
      font: boldFont,
      color: primaryColor,
    });
    y -= size + 3;

    // Divider line
    page.drawLine({
      start: { x: margin, y },
      end: { x: pw - margin, y },
      thickness: 0.75,
      color: ruleColor,
    });
    y -= 8;
  };

  // Render sections according to user order
  for (const sec of order) {
    if (sec === "summary" && data.summary?.trim()) {
      drawSectionTitle("Professional Summary");
      drawWrappedText(data.summary, 10, regularFont, rgb(0.15, 0.15, 0.15), 0, 3);
      y -= 4;
    } else if (sec === "experience" && data.experience?.length > 0) {
      drawSectionTitle("Experience");
      for (const exp of data.experience) {
        if (!exp.title && !exp.company) continue;
        ensureSpace(30);

        // Job Title (Bold, Left) and Dates (Right aligned)
        const titleStr = sanitizeText(exp.title || "Position", boldFont);
        const datesStr = sanitizeText(
          exp.start && exp.end ? `${exp.start} - ${exp.end}` : exp.start || exp.end || "",
          regularFont
        );

        page.drawText(titleStr, {
          x: margin,
          y: y - 10,
          size: 10.5,
          font: boldFont,
          color: rgb(0.1, 0.1, 0.1),
        });

        if (datesStr) {
          const dateW = regularFont.widthOfTextAtSize(datesStr, 9.5);
          page.drawText(datesStr, {
            x: pw - margin - dateW,
            y: y - 10,
            size: 9.5,
            font: regularFont,
            color: subtleTextColor,
          });
        }
        y -= 13;

        // Company (Italic, Left)
        if (exp.company) {
          const companyStr = sanitizeText(exp.company, italicFont);
          page.drawText(companyStr, {
            x: margin,
            y: y - 9.5,
            size: 9.5,
            font: italicFont,
            color: rgb(0.25, 0.25, 0.25),
          });
          y -= 13;
        }

        // Bullets
        for (const bullet of exp.bullets || []) {
          if (!bullet.trim()) continue;
          ensureSpace(14);
          const bulletSymbol = "- ";
          const safeBullet = sanitizeText(bullet, regularFont);
          drawWrappedText(`${bulletSymbol}${safeBullet}`, 9.5, regularFont, rgb(0.15, 0.15, 0.15), 10, 2.5);
        }
        y -= 6;
      }
    } else if (sec === "education" && data.education?.length > 0) {
      drawSectionTitle("Education");
      for (const edu of data.education) {
        if (!edu.degree && !edu.school) continue;
        ensureSpace(20);

        const degreeStr = sanitizeText(
          edu.degree ? (edu.school ? `${edu.degree} - ${edu.school}` : edu.degree) : edu.school,
          boldFont
        );
        const yearStr = sanitizeText(edu.year || "", regularFont);

        page.drawText(degreeStr, {
          x: margin,
          y: y - 10,
          size: 10,
          font: boldFont,
          color: rgb(0.1, 0.1, 0.1),
        });

        if (yearStr) {
          const yearW = regularFont.widthOfTextAtSize(yearStr, 9.5);
          page.drawText(yearStr, {
            x: pw - margin - yearW,
            y: y - 10,
            size: 9.5,
            font: regularFont,
            color: subtleTextColor,
          });
        }
        y -= 15;
      }
      y -= 2;
    } else if (sec === "projects" && data.projects?.length > 0) {
      drawSectionTitle("Projects");
      for (const proj of data.projects) {
        if (!proj.name) continue;
        ensureSpace(24);

        const nameStr = sanitizeText(proj.name, boldFont);
        page.drawText(nameStr, {
          x: margin,
          y: y - 10,
          size: 10,
          font: boldFont,
          color: rgb(0.1, 0.1, 0.1),
        });

        if (proj.tech) {
          const techStr = sanitizeText(` | ${proj.tech}`, italicFont);
          const nameW = boldFont.widthOfTextAtSize(nameStr, 10);
          page.drawText(techStr, {
            x: margin + nameW + 2,
            y: y - 10,
            size: 9,
            font: italicFont,
            color: subtleTextColor,
          });
        }
        y -= 13;

        if (proj.desc) {
          drawWrappedText(proj.desc, 9.5, regularFont, rgb(0.2, 0.2, 0.2), 0, 2.5);
        }
        y -= 5;
      }
    } else if (sec === "skills" && data.skills?.trim()) {
      drawSectionTitle("Technical Skills");
      drawWrappedText(data.skills, 9.5, regularFont, rgb(0.15, 0.15, 0.15), 0, 3);
      y -= 4;
    }
  }

  return await doc.save({ useObjectStreams: true });
}
