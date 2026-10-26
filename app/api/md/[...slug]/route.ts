import { NextRequest, NextResponse } from "next/server";
import { renderRoute, normalizePath, listMarkdownRoutes } from "@/lib/md/registry";
import {
  createMarkdownResponse,
  createMarkdown404,
  createMarkdownOptionsResponse,
} from "@/lib/md/http";
import { SITE_CONFIG } from "@/lib/site-config";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug?: string[] }>;
}

function handleCatalog(request: NextRequest) {
  const routes = listMarkdownRoutes();
  const accept = request.headers.get("accept") || "";

  if (accept.includes("text/markdown")) {
    const lines = [
      `# Markdown Catalog for ${SITE_CONFIG.name}`,
      `> Directory of all ${routes.length} available machine-readable markdown endpoints.`,
      `\nCanonical: ${SITE_CONFIG.url}/api/md/_catalog`,
      `Last updated: 2026-10-26\n`,
      `| Title | HTML URL | Markdown URL | Category |`,
      `| --- | --- | --- | --- |`,
      ...routes.map((r) => `| ${r.title} | ${r.url} | ${r.mdUrl} | ${r.category} |`),
    ];
    return createMarkdownResponse(lines.join("\n"), `${SITE_CONFIG.url}/api/md/_catalog`);
  }

  return NextResponse.json(
    {
      site: SITE_CONFIG.name,
      description: SITE_CONFIG.description,
      totalRoutes: routes.length,
      routes,
    },
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const rawPath = slug && slug.length > 0 ? slug.join("/") : "index";

  if (rawPath === "_catalog" || rawPath === "catalog") {
    return handleCatalog(request);
  }

  const normalized = normalizePath(rawPath);
  const isNegotiated = request.headers.get("x-md-negotiated") === "1";

  const rendered = renderRoute(normalized);
  if (!rendered) {
    return createMarkdown404(normalized);
  }

  return createMarkdownResponse(rendered.markdown, rendered.canonical, {
    isNegotiated,
    lastModified: new Date("2026-10-26T00:00:00Z"),
  });
}

export async function HEAD(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const rawPath = slug && slug.length > 0 ? slug.join("/") : "index";

  if (rawPath === "_catalog" || rawPath === "catalog") {
    const res = handleCatalog(request);
    return new Response(null, {
      status: res.status,
      headers: res.headers,
    });
  }

  const normalized = normalizePath(rawPath);
  const isNegotiated = request.headers.get("x-md-negotiated") === "1";

  const rendered = renderRoute(normalized);
  if (!rendered) {
    return createMarkdown404(normalized, true);
  }

  return createMarkdownResponse(rendered.markdown, rendered.canonical, {
    isNegotiated,
    isHead: true,
    lastModified: new Date("2026-10-26T00:00:00Z"),
  });
}

export async function OPTIONS() {
  return createMarkdownOptionsResponse();
}
