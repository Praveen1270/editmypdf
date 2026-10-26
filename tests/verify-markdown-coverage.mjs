import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. Explicit skip list with reasons
const EXPLICIT_SKIPS = new Map([
  ["offline", "PWA offline fallback cache page; client-only service worker view"],
  ["recent", "User local document processing history; client-only localStorage view"],
  ["starred", "User bookmarked tool favorites; client-only localStorage view"],
]);

async function runCoverageCheck() {
  console.log("🔍 Checking markdown coverage for all public routes...\n");

  // Dynamic import of compiled or tsx module
  const { renderRoute, listMarkdownRoutes, normalizePath } = await import("../lib/md/registry.ts");
  const { prefersMarkdown } = await import("../lib/md/negotiate.ts");

  const appDir = path.join(rootDir, "app");
  const entries = fs.readdirSync(appDir, { withFileTypes: true });

  const foundPageDirs = entries
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(appDir, e.name, "page.tsx")))
    .map((e) => e.name);

  // Add root home page
  const allAppRoutes = ["/", ...foundPageDirs.map((d) => `/${d}`)];

  let passed = true;
  let verifiedCount = 0;
  const skippedCount = EXPLICIT_SKIPS.size;

  for (const route of allAppRoutes) {
    const segment = route === "/" ? "/" : route.slice(1);

    if (EXPLICIT_SKIPS.has(segment)) {
      console.log(`⏩ [SKIPPED] ${route} -> ${EXPLICIT_SKIPS.get(segment)}`);
      continue;
    }

    const rendered = renderRoute(route);
    if (!rendered || !rendered.markdown) {
      console.error(`❌ [MISSING RENDERER] Public route "${route}" has no markdown renderer!`);
      passed = false;
      continue;
    }

    const md = rendered.markdown;
    if (!md.startsWith("# ")) {
      console.error(`❌ [INVALID FORMAT] "${route}" markdown does not start with an H1 title`);
      passed = false;
    }

    if (!md.includes("Canonical: https://editmypdf.co.in")) {
      console.error(`❌ [MISSING CANONICAL] "${route}" markdown lacks canonical URL`);
      passed = false;
    }

    if (!md.includes("Last updated:")) {
      console.error(`❌ [MISSING DATE] "${route}" markdown lacks Last updated field`);
      passed = false;
    }

    verifiedCount++;
  }

  console.log(`\n✅ Verified ${verifiedCount} public routes with active markdown renderers.`);
  console.log(`ℹ️ Skipped ${skippedCount} client-only routes documented in skip list.`);

  // Verify route catalog count matches
  const catalog = listMarkdownRoutes();
  console.log(`📋 Catalog lists ${catalog.length} addressable markdown endpoints.`);

  // Content negotiation tests
  console.log("\n🧪 Running Content Negotiation tests...");
  const tests = [
    { accept: "text/markdown", expected: true, desc: "Exact text/markdown" },
    { accept: "text/markdown;q=0.9, text/html;q=0.8", expected: true, desc: "Higher q markdown" },
    { accept: "text/html, text/markdown;q=0.5", expected: false, desc: "Lower q markdown" },
    { accept: "*/*", expected: false, desc: "Wildcard */*" },
    { accept: "", expected: false, desc: "Empty accept" },
    { accept: null, expected: false, desc: "Null accept" },
    { accept: "text/html,application/xhtml+xml", expected: false, desc: "Browser standard HTML" },
  ];

  for (const t of tests) {
    const result = prefersMarkdown(t.accept);
    if (result !== t.expected) {
      console.error(`❌ Negotiation failed for "${t.desc}": got ${result}, expected ${t.expected}`);
      passed = false;
    } else {
      console.log(`  ✓ ${t.desc}`);
    }
  }

  if (!passed) {
    console.error("\n❌ Route coverage verification failed!");
    process.exit(1);
  }

  console.log("\n🎉 All coverage and negotiation tests passed successfully!");
}

runCoverageCheck().catch((err) => {
  console.error("Fatal error during verification:", err);
  process.exit(1);
});
