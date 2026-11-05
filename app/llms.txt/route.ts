import { listMarkdownRoutes } from "@/lib/md/registry";
import { SITE_CONFIG } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const routes = listMarkdownRoutes();

  const coreRoutes = routes.filter((r) => r.category === "core" || r.category === "informational");
  const toolRoutes = routes.filter((r) => r.category === "tool");
  const legalRoutes = routes.filter((r) => r.category === "legal");

  const lines: string[] = [
    `# ${SITE_CONFIG.name}`,
    ``,
    `> ${SITE_CONFIG.description}`,
    ``,
    `EditMyPDF was founded in ${SITE_CONFIG.foundingYear} as a privacy-first, 100% client-side document processing platform. The pricing model is completely free with no subscriptions, accounts, or watermarks. Built for individuals, legal professionals, students, and businesses who need to modify documents without risking confidential data exposure on third-party servers. Contact: ${SITE_CONFIG.contactEmail}. Repository: ${SITE_CONFIG.githubUrl}.`,
    ``,
    `## Core pages`,
    ...coreRoutes.map((r) => `- [${r.title}](${r.mdUrl}): ${r.description}`),
    ``,
    `## PDF Tools`,
    // Every tool — no truncation. (Previously only the first 50 were listed, silently omitting the rest.)
    ...toolRoutes.map((r) => `- [${r.title}](${r.mdUrl}): ${r.description}`),
    ``,
    `## Machine-readable`,
    `- [Full content](${SITE_CONFIG.url}/llms-full.txt): Every page concatenated into a single fetchable file`,
    `- [Markdown catalog](${SITE_CONFIG.url}/api/md/_catalog): JSON and markdown registry of all routes`,
    `- [Sitemap](${SITE_CONFIG.url}/sitemap.xml): Machine-readable XML sitemap of HTML pages`,
    `- [AI usage policy](${SITE_CONFIG.url}/ai.txt): Policy and licensing terms for AI crawlers and agents`,
    ``,
    `## Optional`,
    ...legalRoutes.map((r) => `- [${r.title}](${r.mdUrl}): ${r.description}`)
  ];

  const text = lines.join("\n") + "\n";

  return new Response(text, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
