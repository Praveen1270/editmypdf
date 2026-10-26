import { SITE_CONFIG } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = `# robots.txt for ${SITE_CONFIG.name} (${SITE_CONFIG.url})
# Note: Keep this file in sync with /llms.txt and /ai.txt
# Machine-readable AI policy: ${SITE_CONFIG.url}/ai.txt
# LLM content directory: ${SITE_CONFIG.url}/llms.txt

User-agent: *
Allow: /
Disallow: /offline
Disallow: /recent
Disallow: /starred
Disallow: /api/

# Search and Answer Engine Citation Bots
User-agent: OAI-SearchBot
Allow: /
Disallow: /offline
Disallow: /recent
Disallow: /starred
Disallow: /api/

User-agent: ChatGPT-User
Allow: /
Disallow: /offline
Disallow: /recent
Disallow: /starred
Disallow: /api/

User-agent: Claude-SearchBot
Allow: /
Disallow: /offline
Disallow: /recent
Disallow: /starred
Disallow: /api/

User-agent: Claude-User
Allow: /
Disallow: /offline
Disallow: /recent
Disallow: /starred
Disallow: /api/

User-agent: PerplexityBot
Allow: /
Disallow: /offline
Disallow: /recent
Disallow: /starred
Disallow: /api/

User-agent: Perplexity-User
Allow: /
Disallow: /offline
Disallow: /recent
Disallow: /starred
Disallow: /api/

# AI Model Training Crawlers (Explicitly Allowed)
User-agent: GPTBot
Allow: /
Disallow: /offline
Disallow: /recent
Disallow: /starred
Disallow: /api/

User-agent: ClaudeBot
Allow: /
Disallow: /offline
Disallow: /recent
Disallow: /starred
Disallow: /api/

User-agent: Google-Extended
Allow: /
Disallow: /offline
Disallow: /recent
Disallow: /starred
Disallow: /api/

User-agent: Applebot-Extended
Allow: /
Disallow: /offline
Disallow: /recent
Disallow: /starred
Disallow: /api/

User-agent: CCBot
Allow: /
Disallow: /offline
Disallow: /recent
Disallow: /starred
Disallow: /api/

User-agent: Bytespider
Allow: /
Disallow: /offline
Disallow: /recent
Disallow: /starred
Disallow: /api/

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
