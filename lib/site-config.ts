import { TOOL_COUNT } from "./tools-data";

// The one literal copy of the site URL. Every other file must use
// SITE_CONFIG.url (or a helper built on it) — never re-type the URL.
const SITE_URL = "https://editmypdf.co.in";

export const SITE_CONFIG = {
  name: "EditMyPDF",
  shortName: "EditMyPDF",
  url: SITE_URL,
  // Counts are derived from the registry (lib/tools-data.ts), never literals:
  // TOOL_COUNT is the marketed count (entries, workflow presets included).
  description: `Privacy-first suite of ${TOOL_COUNT} browser-powered PDF utilities operating with zero server uploads. Merge, split, compress, edit, convert, and sign PDFs locally.`,
  aiSummary: `EditMyPDF is a free, privacy-first web application offering ${TOOL_COUNT} PDF tools that process documents 100% locally in the browser via WebAssembly and Web Workers with zero server uploads.`,
  contactEmail: "founder@editmypdf.co.in",
  githubUrl: "https://github.com/Praveen1270/editmypdf",
  logoUrl: `${SITE_URL}/logo.png`,
  logoSvgUrl: `${SITE_URL}/logo.svg`,
  foundingYear: "2026",
  author: "EditMyPDF Team",
  pricingModel: "100% Free with no registration or paywalls",
  license: "MIT / Proprietary Web Client",
  /** Single "last updated" date for llms.txt / ai.txt / api/md / markdown pages. */
  lastUpdated: "2026-10-26",
  /** Single robots.txt disallow list, shared by app/robots.txt/route.ts. */
  robotsDisallowPaths: ["/offline", "/recent", "/api/"],
} as const;
