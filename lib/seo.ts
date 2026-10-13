import type { Metadata } from "next";
import { PDF_TOOLS } from "./tools-data";

export interface PageSeoConfig {
  title: string;
  description: string;
  canonical: string;
  keywords?: string[];
  noindex?: boolean;
}

export function generatePageMetadata(config: PageSeoConfig): Metadata {
  return {
    title: config.title,
    description: config.description,
    alternates: {
      canonical: config.canonical,
    },
    openGraph: {
      title: `${config.title} | PDFKit`,
      description: config.description,
      url: config.canonical,
      siteName: "PDFKit",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/icon-512.png",
          width: 512,
          height: 512,
          alt: `${config.title} — PDFKit`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.title} | PDFKit`,
      description: config.description,
      images: ["/icon-512.png"],
    },
    robots: config.noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    keywords: config.keywords,
  };
}

export function generateToolMetadataById(toolId: string): Metadata {
  const tool = PDF_TOOLS.find((t) => t.id === toolId);
  if (!tool) {
    return generatePageMetadata({
      title: "PDF Tool — PDFKit",
      description: "Privacy-first PDF utility in your browser.",
      canonical: "/",
    });
  }

  // Titles follow the SEO rule: [Primary query] - [Value prop / Outcome] (under 60 chars)
  const queryFirstTitles: Record<string, { query: string; benefit: string }> = {
    merge: { query: "Merge PDF Files Online", benefit: "Free, Fast & 100% Private" },
    split: { query: "Split PDF Online", benefit: "Extract Pages & Ranges Privately" },
    organize: { query: "Organize PDF Pages", benefit: "Rearrange, Rotate & Delete Online" },
    rotate: { query: "Rotate PDF Online", benefit: "Turn Pages 90°, 180° & 270° Free" },
    extract: { query: "Extract PDF Pages Online", benefit: "Save Specific Pages as PDF" },
    compress: { query: "Compress PDF Online", benefit: "Reduce PDF File Size Privately" },
    "pdf-to-images": { query: "PDF to Images Converter", benefit: "Convert to JPG & PNG Online" },
    "images-to-pdf": { query: "Images to PDF Converter", benefit: "Turn JPG, PNG & WebP to PDF" },
    "pdf-to-text": { query: "PDF to Text Converter", benefit: "Extract Text from PDF Online" },
    "pdf-to-grayscale": { query: "Convert PDF to Grayscale", benefit: "Make Black & White PDF Online" },
    "page-numbers": { query: "Add Page Numbers to PDF", benefit: "Customize Position & Format" },
    watermark: { query: "Watermark PDF Online", benefit: "Add Custom Text Watermarks Free" },
    "add-text": { query: "Add Text to PDF Online", benefit: "Insert Notes, Headers & Footers" },
    crop: { query: "Crop PDF Online", benefit: "Trim Margins & Page Boundaries" },
    resize: { query: "Resize PDF Pages Online", benefit: "Change to A4, Letter & Custom Sizes" },
    protect: { query: "Protect PDF with Password", benefit: "Encrypt with AES-256 Online" },
    unlock: { query: "Unlock PDF Online", benefit: "Remove Password Security Privately" },
    "metadata-editor": { query: "PDF Metadata Editor", benefit: "View, Edit & Strip PDF Metadata" },
    "page-counter": { query: "PDF Page Counter & Properties", benefit: "Count Pages & Inspect Dimensions" },
    compare: { query: "Compare Two PDF Files", benefit: "Side-by-Side Diff & Text Comparison" },
  };

  const titleConfig = queryFirstTitles[tool.id] || {
    query: tool.name,
    benefit: "Free & Private in Your Browser",
  };

  const fullTitle = `${titleConfig.query} - ${titleConfig.benefit}`;

  return generatePageMetadata({
    title: fullTitle,
    description: tool.description,
    canonical: tool.href,
    keywords: [
      ...tool.keywords,
      "online pdf tool",
      "free pdf utility",
      "client side pdf",
      "private pdf editor",
      "no upload pdf",
    ],
  });
}
