import type { Metadata } from "next";
import { PDF_TOOLS } from "./tools-data";
import { SITE_CONFIG } from "./site-config";

export interface PageSeoConfig {
  title: string;
  description: string;
  canonical: string;
  keywords?: string[];
  noindex?: boolean;
  aiSummary?: string;
}

export function generatePageMetadata(config: PageSeoConfig): Metadata {
  const mdUrl =
    config.canonical === "/"
      ? `${SITE_CONFIG.url}/index.md`
      : `${SITE_CONFIG.url}${config.canonical.startsWith("/") ? config.canonical : `/${config.canonical}`}.md`;

  const summary = config.aiSummary || config.description;

  return {
    title: config.title,
    description: config.description,
    alternates: {
      canonical: config.canonical,
      types: {
        "text/markdown": mdUrl,
      },
    },
    other: {
      "ai-summary": summary,
    },
    openGraph: {
      title: `${config.title} | ${SITE_CONFIG.name}`,
      description: config.description,
      url: config.canonical,
      siteName: SITE_CONFIG.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/icon-512.png",
          width: 512,
          height: 512,
          alt: `${config.title} — ${SITE_CONFIG.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.title} | ${SITE_CONFIG.name}`,
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
      title: `PDF Tool — ${SITE_CONFIG.name}`,
      description: "Privacy-first PDF utility in your browser.",
      canonical: "/",
    });
  }

  // Titles follow SEO Title Optimization: [Primary query] - [Modifier/Benefit] (target 40-55 chars total with brand)
  const queryFirstTitles: Record<string, { query: string; benefit: string }> = {
    merge: { query: "Merge PDF Files Online", benefit: "Free & Private" },
    split: { query: "Split PDF Online", benefit: "Free & Private" },
    organize: { query: "Organize PDF Pages", benefit: "Reorder & Rotate" },
    rotate: { query: "Rotate PDF Online", benefit: "Free & Instant" },
    extract: { query: "Extract PDF Pages", benefit: "Save Specific Pages" },
    compress: { query: "Compress PDF Online", benefit: "Reduce File Size Free" },
    "pdf-to-images": { query: "Convert PDF to JPG & PNG", benefit: "Free & Fast" },
    "images-to-pdf": { query: "Convert Images to PDF", benefit: "JPG, PNG to PDF" },
    "pdf-to-text": { query: "PDF to Text Converter", benefit: "Extract Text Free" },
    "pdf-to-grayscale": { query: "Convert PDF to Grayscale", benefit: "Black & White" },
    "page-numbers": { query: "Add Page Numbers to PDF", benefit: "Free & Fast" },
    "edit-pdf": { query: "Edit PDF Online", benefit: "Edit Text & Sign Free" },
    watermark: { query: "Watermark PDF Online", benefit: "Custom Text Stamp" },
    "add-text": { query: "Add Text to PDF", benefit: "Header, Notes & Footer" },
    crop: { query: "Crop PDF Online", benefit: "Trim Margins Free" },
    resize: { query: "Resize PDF Pages", benefit: "A4, Letter & Custom" },
    protect: { query: "Password Protect PDF", benefit: "AES-256 Encryption" },
    unlock: { query: "Unlock PDF Online", benefit: "Remove Password Free" },
    "metadata-editor": { query: "PDF Metadata Editor", benefit: "Edit & Strip Tags" },
    "page-counter": { query: "PDF Page Counter", benefit: "Inspect Dimensions" },
    compare: { query: "Compare Two PDF Files", benefit: "Visual & Text Diff" },
    whiteboard: { query: "Online Whiteboard", benefit: "Draw & Collaborate" },
    "gst-invoice": { query: "GST Invoice Generator", benefit: "Tax Invoices" },
    // High-volume conversion queries that previously fell back to a generic title
    "pdf-to-word": { query: "PDF to Word Converter Online", benefit: "Free & Private" },
    "word-to-pdf": { query: "Word to PDF Converter Online", benefit: "Free & Private" },
    "excel-to-pdf": { query: "Excel to PDF Converter Online", benefit: "Free & Private" },
    "pdf-to-excel": { query: "PDF to Excel Converter Online", benefit: "Free & Private" },
    "pdf-to-powerpoint": { query: "PDF to PowerPoint Converter", benefit: "Free & Private" },
    "powerpoint-to-pdf": { query: "PowerPoint to PDF Converter", benefit: "Free & Private" },
    "images-to-pdf": { query: "Images to PDF Converter Online", benefit: "JPG, PNG Free" },
    "pdf-to-epub": { query: "PDF to EPUB Converter Online", benefit: "Free & Private" },
    "pdf-to-html": { query: "PDF to HTML Converter Online", benefit: "Free & Private" },
    "pdf-to-markdown": { query: "PDF to Markdown Converter", benefit: "Free & Private" },
    "pdf-to-pdfa": { query: "Convert PDF to PDF/A Online", benefit: "Free & Private" },
    "csv-to-pdf": { query: "CSV to PDF Converter Online", benefit: "Free & Private" },
    "markdown-to-pdf": { query: "Markdown to PDF Converter", benefit: "Free & Private" },
    "html-to-pdf": { query: "HTML to PDF Converter Online", benefit: "Free & Private" },
    "ebook-to-pdf": { query: "EPUB to PDF Converter Online", benefit: "Free & Private" },
    "create-pdf": { query: "Create PDF Online", benefit: "Free & Private" },
    // High-intent edit / security queries
    "sign-pdf": { query: "Sign PDF Online", benefit: "Free & Private" },
    redact: { query: "Redact PDF Online", benefit: "Remove Text Free" },
    ocr: { query: "OCR PDF Online", benefit: "Searchable PDF Free" },
    flatten: { query: "Flatten PDF Online", benefit: "Free & Private" },
    "remove-pages": { query: "Remove PDF Pages Online", benefit: "Delete Pages Free" },
    "scan-to-pdf": { query: "Scan to PDF Online", benefit: "Camera to PDF Free" },
    "translate-pdf": { query: "Translate PDF Online", benefit: "Free & Private" },
    "pdf-forms": { query: "Fill PDF Forms Online", benefit: "Free & Private" },
    "headers-footers": { query: "Add Header & Footer to PDF", benefit: "Free & Private" },
    repair: { query: "Repair PDF Online", benefit: "Fix Corrupted PDF" },
    invert: { query: "Invert PDF Colours Online", benefit: "Dark Mode Free" },
    "privacy-scan": { query: "PDF Privacy Scanner Online", benefit: "Check Risks Free" },
    fingerprint: { query: "Fingerprint PDF Online", benefit: "Trace Leaks Free" },
    "p2p-share": { query: "Share PDF Online Privately", benefit: "P2P, No Upload" },
    "chat-with-pdf": { query: "Chat With PDF Online", benefit: "Ask Your PDF Free" },
    "ai-summarizer": { query: "AI PDF Summarizer Online", benefit: "Summarize Free" },
    "pos-billing": { query: "POS Billing Software Online", benefit: "GST Receipts Free" },
    "latex-resume": { query: "LaTeX Resume Builder Online", benefit: "ATS-Friendly PDF" },
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
    aiSummary: `${tool.name} processes documents 100% locally in your browser. ${tool.description}`,
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
