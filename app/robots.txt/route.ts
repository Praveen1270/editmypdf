import { SITE_CONFIG } from "@/lib/site-config";

export const dynamic = "force-dynamic";

// One shared disallow list (SITE_CONFIG.robotsDisallowPaths) rendered for
// every user-agent block, so a path is never disallowed in one block and
// forgotten in another.
const USER_AGENT_GROUPS: { comment?: string; agents: string[] }[] = [
  { agents: ["*"] },
  {
    comment: "Search and Answer Engine Citation Bots",
    agents: ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User"],
  },
  {
    comment: "AI Model Training Crawlers (Explicitly Allowed)",
    agents: ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider"],
  },
];

export async function GET() {
  const blocks = USER_AGENT_GROUPS.map((group) => {
    const lines = [
      ...(group.comment ? [`# ${group.comment}`] : []),
      ...group.agents.map(
        (agent) =>
          `User-agent: ${agent}\nAllow: /\n${SITE_CONFIG.robotsDisallowPaths
            .map((p) => `Disallow: ${p}`)
            .join("\n")}`
      ),
    ];
    return lines.join("\n");
  }).join("\n\n");

  const content = `# robots.txt for ${SITE_CONFIG.name} (${SITE_CONFIG.url})
# Machine-readable AI policy: ${SITE_CONFIG.url}/ai.txt
# LLM content directory: ${SITE_CONFIG.url}/llms.txt

${blocks}

Sitemap: ${SITE_CONFIG.url}/sitemap.xml
Host: ${SITE_CONFIG.url}
`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
