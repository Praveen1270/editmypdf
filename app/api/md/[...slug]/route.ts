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
      `Last updated: ${SITE_CONFIG.lastUpdated}\n`,
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

// One shared implementation for GET and HEAD: HEAD returns the same status
// and headers with an empty body (via createMarkdownResponse's isHead flag
// and a bodyless catalog response), instead of duplicating the routing.
async function handleMarkdown(request: NextRequest, { params }: RouteParams, isHead: boolean) {
  const { slug } = await params;
  const rawPath = slug && slug.length > 0 ? slug.join("/") : "index";

  if (rawPath === "_catalog" || rawPath === "catalog") {
    const res = handleCatalog(request);
    return isHead
      ? new Response(null, { status: res.status, headers: res.headers })
      : res;
  }

  const normalized = normalizePath(rawPath);
  const isNegotiated = request.headers.get("x-md-negotiated") === "1";

  const rendered = renderRoute(normalized);
  if (!rendered) {
    return createMarkdown404(normalized, isHead);
  }

  return createMarkdownResponse(rendered.markdown, rendered.canonical, {
    isNegotiated,
    isHead,
    lastModified: new Date(`${SITE_CONFIG.lastUpdated}T00:00:00Z`),
  });
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return handleMarkdown(request, { params }, false);
}

export async function HEAD(request: NextRequest, { params }: RouteParams) {
  return handleMarkdown(request, { params }, true);
}

export async function OPTIONS() {
  return createMarkdownOptionsResponse();
}
