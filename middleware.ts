import { NextResponse, type NextRequest } from "next/server";
import { prefersMarkdown } from "@/lib/md/negotiate";

const DESCRIBED_BY_LINK =
  '<https://editmypdf.co.in/llms.txt>; rel="describedby", <https://editmypdf.co.in/llms-full.txt>; rel="describedby", <https://editmypdf.co.in/ai.txt>; rel="describedby"';

const EXCLUDED_PREFIXES = [
  "/api/",
  "/_next/",
  "/.well-known/",
];

const EXCLUDED_EXACT = new Set([
  "/llms.txt",
  "/llms-full.txt",
  "/ai.txt",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/logo.png",
  "/logo.svg",
  "/icon.svg",
  "/icon-512.png",
  "/sw.js",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Direct pass-through for excluded routes and static files
  if (
    EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    EXCLUDED_EXACT.has(pathname) ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map|webmanifest)$/i)
  ) {
    return NextResponse.next();
  }

  // 2. Handle .md URL suffix (e.g., /pricing.md -> /api/md/pricing, /index.md -> /api/md/index)
  if (pathname.endsWith(".md")) {
    const rawSlug = pathname.slice(1, -3); // remove leading '/' and trailing '.md'
    const targetSlug = rawSlug === "" ? "index" : rawSlug;

    const rewriteUrl = new URL(`/api/md/${targetSlug}`, request.url);
    const rewriteHeaders = new Headers(request.headers);

    const response = NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: rewriteHeaders,
      },
    });

    response.headers.set("Link", DESCRIBED_BY_LINK);
    return response;
  }

  // 3. Content negotiation via Accept header
  const acceptHeader = request.headers.get("accept");
  if (prefersMarkdown(acceptHeader)) {
    const targetSlug = pathname === "/" ? "index" : pathname.slice(1);
    const rewriteUrl = new URL(`/api/md/${targetSlug}`, request.url);

    const rewriteHeaders = new Headers(request.headers);
    rewriteHeaders.set("x-md-negotiated", "1");

    const response = NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: rewriteHeaders,
      },
    });

    response.headers.set("Link", DESCRIBED_BY_LINK);
    return response;
  }

  // 4. Default HTML response - attach describedby Link header
  const response = NextResponse.next();
  const existingLink = response.headers.get("Link");
  if (existingLink) {
    response.headers.set("Link", `${existingLink}, ${DESCRIBED_BY_LINK}`);
  } else {
    response.headers.set("Link", DESCRIBED_BY_LINK);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
