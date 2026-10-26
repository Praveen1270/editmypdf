import { listMarkdownRoutes, renderRoute } from "@/lib/md/registry";
import { SITE_CONFIG } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const routes = listMarkdownRoutes();

  // Order: core -> informational -> tool -> legal
  const orderWeight: Record<string, number> = {
    core: 1,
    informational: 2,
    tool: 3,
    legal: 4,
  };

  const sortedRoutes = [...routes].sort((a, b) => {
    const wa = orderWeight[a.category] || 99;
    const wb = orderWeight[b.category] || 99;
    if (wa !== wb) return wa - wb;
    return a.path.localeCompare(b.path);
  });

  const parts: string[] = [
    `# ${SITE_CONFIG.name} - Full Content`,
    `> ${SITE_CONFIG.description}`,
    `Generated: 2026-10-26`,
    `Source: ${SITE_CONFIG.url}`,
    `Contact: ${SITE_CONFIG.contactEmail}`,
    `Total Documents: ${sortedRoutes.length}`,
  ];

  for (const route of sortedRoutes) {
    if (!route.inLlmsFull) continue;
    const rendered = renderRoute(route.path);
    if (!rendered) continue;

    parts.push(`\n---\n<!-- source: ${route.url} -->\n${rendered.markdown.trim()}`);
  }

  const fullText = parts.join("\n") + "\n";

  if (fullText.length > 500000) {
    console.warn(
      `[llms-full.txt] Output size is ${fullText.length} characters, which exceeds the recommended 500k character target.`
    );
  }

  return new Response(fullText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
