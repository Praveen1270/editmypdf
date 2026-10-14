/**
 * Font matching for the /edit-pdf editor.
 *
 * Strategy (per spec):
 *  1. Strip subset prefixes (e.g. "ABCDEF+") and normalize the PDF font name.
 *  2. Detect the script of the text (Latin / Devanagari / Telugu / other) —
 *     non-Latin scripts always map to Noto coverage fonts.
 *  3. Map to a bundled metric-compatible font (all OFL/Apache, self-hosted):
 *       Arial/Helvetica -> Arimo        (Apache-2.0, Liberation-metric clone)
 *       Times           -> Tinos        (Apache-2.0, Liberation-metric clone)
 *       Courier         -> Cousine      (Apache-2.0, Liberation-metric clone)
 *       Calibri         -> Carlito     (OFL)
 *       Cambria         -> Caladea      (OFL)
 *       Georgia/Garamond/Palatino/serif -> Noto Serif (OFL)
 *       anything else   -> Noto Sans   (OFL; widest coverage)
 *  4. Embedded subsets harvested from the PDF are registered via FontFace so
 *     the overlay renders with the REAL font; on every keystroke we check the
 *     subset cmap (fontkit) and fall back to the matched bundled font when a
 *     typed glyph is missing, showing a notice.
 *  5. The font dropdown offers bundled fonts + the standard 14 PDF fonts.
 */
import { StandardFonts } from "pdf-lib";

export interface BundledFontDef {
  id: string;
  label: string;
  /** CSS family for on-screen rendering (via @fontsource). */
  cssFamily: string;
  /** Self-hosted TTF paths (served from /fonts/edit-pdf/). */
  ttf: { regular: string; italic: string; bold: string; boldItalic: string };
  license: string;
}

export const BUNDLED_FONTS: BundledFontDef[] = [
  {
    id: "Arimo",
    label: "Arimo (Arial / Helvetica metric match)",
    cssFamily: "Arimo",
    ttf: {
      regular: "/fonts/edit-pdf/Arimo-Regular.ttf",
      italic: "/fonts/edit-pdf/Arimo-Italic.ttf",
      bold: "/fonts/edit-pdf/Arimo-Bold.ttf",
      boldItalic: "/fonts/edit-pdf/Arimo-BoldItalic.ttf",
    },
    license: "Apache-2.0",
  },
  {
    id: "Tinos",
    label: "Tinos (Times New Roman metric match)",
    cssFamily: "Tinos",
    ttf: {
      regular: "/fonts/edit-pdf/Tinos-Regular.ttf",
      italic: "/fonts/edit-pdf/Tinos-Italic.ttf",
      bold: "/fonts/edit-pdf/Tinos-Bold.ttf",
      boldItalic: "/fonts/edit-pdf/Tinos-BoldItalic.ttf",
    },
    license: "Apache-2.0",
  },
  {
    id: "Cousine",
    label: "Cousine (Courier New metric match)",
    cssFamily: "Cousine",
    ttf: {
      regular: "/fonts/edit-pdf/Cousine-Regular.ttf",
      italic: "/fonts/edit-pdf/Cousine-Italic.ttf",
      bold: "/fonts/edit-pdf/Cousine-Bold.ttf",
      boldItalic: "/fonts/edit-pdf/Cousine-BoldItalic.ttf",
    },
    license: "Apache-2.0",
  },
  {
    id: "Carlito",
    label: "Carlito (Calibri metric match)",
    cssFamily: "Carlito",
    ttf: {
      regular: "/fonts/edit-pdf/Carlito-Regular.ttf",
      italic: "/fonts/edit-pdf/Carlito-Italic.ttf",
      bold: "/fonts/edit-pdf/Carlito-Bold.ttf",
      boldItalic: "/fonts/edit-pdf/Carlito-BoldItalic.ttf",
    },
    license: "OFL-1.1",
  },
  {
    id: "Caladea",
    label: "Caladea (Cambria metric match)",
    cssFamily: "Caladea",
    ttf: {
      regular: "/fonts/edit-pdf/Caladea-Regular.ttf",
      italic: "/fonts/edit-pdf/Caladea-Italic.ttf",
      bold: "/fonts/edit-pdf/Caladea-Bold.ttf",
      boldItalic: "/fonts/edit-pdf/Caladea-BoldItalic.ttf",
    },
    license: "OFL-1.1",
  },
  {
    id: "NotoSerif",
    label: "Noto Serif (Georgia / Garamond / Palatino)",
    cssFamily: "Noto Serif",
    ttf: {
      regular: "/fonts/edit-pdf/NotoSerif-Variable.ttf",
      italic: "/fonts/edit-pdf/NotoSerif-Variable.ttf",
      bold: "/fonts/edit-pdf/NotoSerif-Variable.ttf",
      boldItalic: "/fonts/edit-pdf/NotoSerif-Variable.ttf",
    },
    license: "OFL-1.1",
  },
  {
    id: "NotoSans",
    label: "Noto Sans (universal fallback)",
    cssFamily: "Noto Sans",
    ttf: {
      regular: "/fonts/edit-pdf/NotoSans-Variable.ttf",
      italic: "/fonts/edit-pdf/NotoSans-Variable.ttf",
      bold: "/fonts/edit-pdf/NotoSans-Variable.ttf",
      boldItalic: "/fonts/edit-pdf/NotoSans-Variable.ttf",
    },
    license: "OFL-1.1",
  },
  {
    id: "NotoSansDevanagari",
    label: "Noto Sans Devanagari (Hindi / Marathi)",
    cssFamily: "Noto Sans Devanagari",
    ttf: {
      regular: "/fonts/edit-pdf/NotoSansDevanagari-Variable.ttf",
      italic: "/fonts/edit-pdf/NotoSansDevanagari-Variable.ttf",
      bold: "/fonts/edit-pdf/NotoSansDevanagari-Variable.ttf",
      boldItalic: "/fonts/edit-pdf/NotoSansDevanagari-Variable.ttf",
    },
    license: "OFL-1.1",
  },
  {
    id: "NotoSansTelugu",
    label: "Noto Sans Telugu",
    cssFamily: "Noto Sans Telugu",
    ttf: {
      regular: "/fonts/edit-pdf/NotoSansTelugu-Variable.ttf",
      italic: "/fonts/edit-pdf/NotoSansTelugu-Variable.ttf",
      bold: "/fonts/edit-pdf/NotoSansTelugu-Variable.ttf",
      boldItalic: "/fonts/edit-pdf/NotoSansTelugu-Variable.ttf",
    },
    license: "OFL-1.1",
  },
];

export function getBundledFont(id: string): BundledFontDef | null {
  return BUNDLED_FONTS.find((f) => f.id === id) ?? null;
}

/** Standard 14 PDF fonts offered in the dropdown (no embedding needed). */
export interface StandardFontOption {
  id: string;
  label: string;
  cssFamily: string;
  pdfLib: StandardFonts;
}

export const STANDARD_FONT_OPTIONS: StandardFontOption[] = [
  { id: "std-Helvetica", label: "Helvetica", cssFamily: "Helvetica, Arial, sans-serif", pdfLib: StandardFonts.Helvetica },
  { id: "std-Helvetica-Bold", label: "Helvetica Bold", cssFamily: "Helvetica, Arial, sans-serif", pdfLib: StandardFonts.HelveticaBold },
  { id: "std-Times-Roman", label: "Times Roman", cssFamily: "Times New Roman, Times, serif", pdfLib: StandardFonts.TimesRoman },
  { id: "std-Times-Bold", label: "Times Bold", cssFamily: "Times New Roman, Times, serif", pdfLib: StandardFonts.TimesRomanBold },
  { id: "std-Courier", label: "Courier", cssFamily: "Courier New, Courier, monospace", pdfLib: StandardFonts.Courier },
  { id: "std-Courier-Bold", label: "Courier Bold", cssFamily: "Courier New, Courier, monospace", pdfLib: StandardFonts.CourierBold },
];

export function isStandardFontId(fontId: string): boolean {
  return fontId.startsWith("std-");
}

export function getStandardFontOption(fontId: string): StandardFontOption | null {
  return STANDARD_FONT_OPTIONS.find((f) => f.id === fontId) ?? null;
}

/** CSS font-family stack for any font id (bundled, standard, or embedded). */
export function cssFamilyForFontId(fontId: string, bold: boolean): string {
  if (fontId.startsWith("embedded:")) {
    const fam = fontId.slice("embedded:".length);
    return `"${fam}", sans-serif`;
  }
  const bundled = getBundledFont(fontId);
  if (bundled) return `"${bundled.cssFamily}", sans-serif`;
  const std = getStandardFontOption(fontId);
  if (std) return std.cssFamily;
  return "sans-serif";
}

/** Strip subset prefix ("ABCDEF+MyFont" -> "MyFont"). */
export function stripSubsetPrefix(name: string): string {
  const m = /^[A-Z]{6}\+(.+)$/.exec((name || "").trim());
  return m ? m[1] : (name || "").trim();
}

/** Normalize a PDF font name for mapping (lowercase, split on - , _ +). */
export function normalizeFontName(name: string): string {
  return stripSubsetPrefix(name).toLowerCase().replace(/[_+,]/g, "-");
}

export function detectBoldFromName(name: string): boolean {
  const n = normalizeFontName(name);
  return (
    n.includes("bold") || n.includes("black") || n.includes("heavy") ||
    n.includes("demi") || n.includes("900") || n.includes("800") || n.includes("700")
  );
}

export function detectItalicFromName(name: string): boolean {
  const n = normalizeFontName(name);
  return n.includes("italic") || n.includes("oblique") || n.includes("slant");
}

export type ScriptKind = "devanagari" | "telugu" | "latin-other";

export function detectScript(text: string): ScriptKind {
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp >= 0x0900 && cp <= 0x097f) return "devanagari";
    if (cp >= 0x0c00 && cp <= 0x0c7f) return "telugu";
  }
  return "latin-other";
}

function hasAny(hay: string, needles: string[]): boolean {
  return needles.some((n) => hay.includes(n));
}

/**
 * Map a PDF font name (+ optional sample text for script detection) to a
 * bundled font id. Pre-selects the matched font in the dropdown.
 */
export function matchBundledFontId(pdfFontName: string, sampleText = ""): string {
  const script = detectScript(sampleText);
  if (script === "devanagari") return "NotoSansDevanagari";
  if (script === "telugu") return "NotoSansTelugu";

  const n = normalizeFontName(pdfFontName);
  // Bare pdf.js fallback generics (font not yet loaded): map conservatively.
  if (n === "sans-serif") return "Arimo";
  if (n === "serif") return "Tinos";
  if (n === "monospace") return "Cousine";
  if (hasAny(n, ["courier", "cousine", "mono", "typewriter", "consolas", "letter-gothic", "nimbus-mono", "liberation-mono"])) return "Cousine";
  if (hasAny(n, ["caladea", "cambria"])) return "Caladea";
  if (hasAny(n, ["carlito", "calibri", "candara", "corbel"])) return "Carlito";
  if (hasAny(n, ["tinos", "times", "liberation-serif", "nimbus-roman", "stix", "garamond", "palatino", "bookman", "baskerville", "georgia", "charter"])) {
    if (hasAny(n, ["garamond", "palatino", "georgia", "bookman", "baskerville", "charter"])) return "NotoSerif";
    return "Tinos";
  }
  if (hasAny(n, ["arimo", "helvetica", "arial", "liberation-sans", "nimbus-sans", "verdana", "tahoma", "segoe", "open-sans", "roboto", "inter", "dejavu", "freesans", "univers", "frutiger", "myriad", "noto-sans", "notosans"])) return "Arimo";
  if (hasAny(n, ["serif"])) return "NotoSerif";
  if (hasAny(n, ["sans"])) return "Arimo";
  // Symbol / ZapfDingbats / decorative fonts cannot be matched — use widest coverage.
  return "NotoSans";
}

/** TTF path for a bundled font id + weight/style. */
export function ttfPathFor(fontId: string, bold: boolean, italic: boolean): string | null {
  const def = getBundledFont(fontId);
  if (!def) return null;
  if (bold && italic) return def.ttf.boldItalic;
  if (bold) return def.ttf.bold;
  if (italic) return def.ttf.italic;
  return def.ttf.regular;
}

/** Register harvested embedded-subset bytes as a browser FontFace. */
export async function registerEmbeddedFontFace(family: string, bytes: Uint8Array): Promise<boolean> {
  try {
    if (typeof window === "undefined" || !("FontFace" in window)) return false;
    const copy = new Uint8Array(bytes.length);
    copy.set(bytes);
    const face = new FontFace(family, copy.buffer as ArrayBuffer, {});
    const loaded = await face.load();
    document.fonts.add(loaded);
    return true;
  } catch {
    return false;
  }
}

/** Lazily loaded fontkit (browser + node compatible). */
let fontkitModule: any = null;
export async function getFontkit(): Promise<any> {
  if (!fontkitModule) {
    const mod = await import("@pdf-lib/fontkit");
    fontkitModule = (mod as any).default ?? mod;
  }
  return fontkitModule;
}

const coverageCache = new Map<string, any>();

/**
 * Check whether every character of `text` exists in the font's cmap.
 * Uses fontkit; results cached per font-bytes identity + text.
 */
export async function checkGlyphCoverage(
  fontBytes: Uint8Array,
  cacheKey: string,
  text: string
): Promise<{ covered: boolean; missing: string[] }> {
  const missing: string[] = [];
  try {
    let font = coverageCache.get(cacheKey);
    if (!font) {
      const fk = await getFontkit();
      font = fk.create(fontBytes);
      coverageCache.set(cacheKey, font);
      if (coverageCache.size > 24) {
        const first = coverageCache.keys().next().value as string;
        coverageCache.delete(first);
      }
    }
    const seen = new Set<string>();
    for (const ch of text) {
      if (ch === "\n" || ch === "\r" || ch === "\t" || ch === " ") continue;
      if (seen.has(ch)) continue;
      seen.add(ch);
      const cp = ch.codePointAt(0) ?? 0;
      let has = false;
      try {
        if (typeof font.hasGlyphForCodePoint === "function") {
          has = font.hasGlyphForCodePoint(cp);
        } else if (typeof font.glyphForCodePoint === "function") {
          const g = font.glyphForCodePoint(cp);
          has = !!g && (g.id ?? 0) !== 0;
        }
      } catch {
        has = false;
      }
      if (!has) missing.push(ch);
    }
  } catch {
    return { covered: false, missing: [...new Set(text.replace(/\s/g, "").split(""))] };
  }
  return { covered: missing.length === 0, missing };
}

/** True for raw TTF/OTF font bytes (the only kinds fontkit/pdf-lib can embed). */
export function looksLikeEmbeddableFont(bytes: Uint8Array): boolean {
  if (!bytes || bytes.length < 12) return false;
  const m0 = bytes[0];
  const m1 = bytes[1];
  const m2 = bytes[2];
  const m3 = bytes[3];
  if (m0 === 0x00 && m1 === 0x01 && m2 === 0x00 && m3 === 0x00) return true; // TrueType / variable
  const tag = String.fromCharCode(m0, m1, m2, m3);
  return tag === "OTTO" || tag === "true" || tag === "ttcf";
}
