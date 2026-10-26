import { estimateTokens } from "./format";

export interface MarkdownResponseOptions {
  status?: number;
  isNegotiated?: boolean;
  lastModified?: Date;
  isHead?: boolean;
}

export function buildMarkdownHeaders(
  bodyText: string,
  canonicalUrl: string,
  options: MarkdownResponseOptions = {}
): Headers {
  const headers = new Headers();

  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set("X-Markdown-Tokens", estimateTokens(bodyText).toString());
  headers.set("X-Robots-Tag", options.status === 404 ? "noindex, nofollow" : "noindex, follow");
  headers.set("Content-Location", canonicalUrl);
  headers.set("Link", `<${canonicalUrl}>; rel="canonical"`);

  if (options.isNegotiated) {
    headers.set("Vary", "Accept");
  }

  headers.set(
    "Cache-Control",
    options.status === 404
      ? "no-cache, no-store, must-revalidate"
      : "public, s-maxage=3600, stale-while-revalidate=86400"
  );

  if (options.lastModified) {
    headers.set("Last-Modified", options.lastModified.toUTCString());
  }

  // CORS
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");

  return headers;
}

export function createMarkdownResponse(
  bodyText: string,
  canonicalUrl: string,
  options: MarkdownResponseOptions = {}
): Response {
  const status = options.status ?? 200;
  const headers = buildMarkdownHeaders(bodyText, canonicalUrl, options);

  if (options.isHead) {
    return new Response(null, { status, headers });
  }

  return new Response(bodyText, { status, headers });
}

export function createMarkdownOptionsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export function createMarkdown404(attemptedPath: string, isHead = false): Response {
  const body = `# 404 Not Found

> The requested markdown document could not be found.

Canonical: https://editmypdf.co.in${attemptedPath.startsWith("/") ? attemptedPath : `/${attemptedPath}`}
Last updated: 2026-10-26

The route \`${attemptedPath}\` is not a registered public route on EditMyPDF, or has been moved.

## Available Resources
- [Browse All Tools](https://editmypdf.co.in)
- [Markdown Route Catalog](https://editmypdf.co.in/api/md/_catalog)
- [LLMs Site Index](https://editmypdf.co.in/llms.txt)
`;

  return createMarkdownResponse(body, `https://editmypdf.co.in${attemptedPath.startsWith("/") ? attemptedPath : `/${attemptedPath}`}`, {
    status: 404,
    isHead,
  });
}
