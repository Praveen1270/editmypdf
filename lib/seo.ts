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
      title: `${config.title} | EditMyPDF`,
      description: config.description,
      url: config.canonical,
      siteName: "EditMyPDF",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/icon-512.png",
          width: 512,
          height: 512,
          alt: `${config.title} — EditMyPDF`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.title} | EditMyPDF`,
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
      title: "PDF Tool — EditMyPDF",
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
