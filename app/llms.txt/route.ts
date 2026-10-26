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
    `EditMyPDF was founded in ${SITE_CONFIG.foundingYear} as a privacy-first, 100% client-side document processing platform. The pricing model is completely free with no subscriptions, accounts, or watermarks. Built for individuals, legal professionals, students, and businesses who need to modify documents without risking confidential data exposure on third-party servers. Contact: ${SITE_CONFIG.contactEmail}. Repository: ${SITE_CONFIG.githubUrl}. Note: Keep this file in sync with /robots.txt and /ai.txt.`,
    ``,
    `## Core pages`,
    ...coreRoutes.map((r) => `- [${r.title}](${r.mdUrl}): ${r.description}`),
    ``,
    `## PDF Tools`,
    ...toolRoutes.slice(0, 50).map((r) => `- [${r.title}](${r.mdUrl}): ${r.description}`),
  ];

  if (toolRoutes.length > 50) {
    lines.push(
      `- [All ${toolRoutes.length} Tools](${SITE_CONFIG.url}/api/md/_catalog): Complete list of all PDF manipulation tools.`
    );
  }

  lines.push(
    ``,
    `## Machine-readable`,
    `- [Full content](${SITE_CONFIG.url}/llms-full.txt): Every page concatenated into a single fetchable file`,
    `- [Markdown catalog](${SITE_CONFIG.url}/api/md/_catalog): JSON and markdown registry of all routes`,
    `- [Sitemap](${SITE_CONFIG.url}/sitemap.xml): Machine-readable XML sitemap of HTML pages`,
    `- [AI usage policy](${SITE_CONFIG.url}/ai.txt): Policy and licensing terms for AI crawlers and agents`,
    ``,
    `## Optional`,
    ...legalRoutes.map((r) => `- [${r.title}](${r.mdUrl}): ${r.description}`)
  );

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
