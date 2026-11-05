import type { Metadata } from "next";
import { getToolById } from "./tools-data";
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

/**
 * Per-tool metadata, derived from the single registry (lib/tools-data.ts).
 * The query-first SEO title lives on the ToolItem (`seoTitle`); tools without
 * one fall back to "<name> - Free & Private in Your Browser".
 *
 * Throws on an unknown id: a mistyped tool id in a layout must fail loudly
 * instead of silently publishing a generic "PDF Tool" page at canonical "/".
 */
export function generateToolMetadataById(toolId: string): Metadata {
  const tool = getToolById(toolId);
  if (!tool) {
    throw new Error(
      `generateToolMetadataById: unknown tool id "${toolId}" — no such entry in lib/tools-data.ts`
    );
  }

  // Titles follow SEO Title Optimization: [Primary query] - [Modifier/Benefit]
  const fullTitle = tool.seoTitle ?? `${tool.name} - Free & Private in Your Browser`;

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
