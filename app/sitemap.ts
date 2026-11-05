import { MetadataRoute } from "next";
import { PDF_TOOLS, isRealToolRoute } from "@/lib/tools-data";
import { SITE_CONFIG } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;

  // Core informational pages. No lastModified is set on purpose: previously
  // every page was stamped with the build time, which told search engines
  // every URL had changed on every deploy. Crawlers should re-check on
  // changeFrequency instead.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy-policy`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/terms`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/disclaimer`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/cookie-policy`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/how-it-works`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/security`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/accessibility`, changeFrequency: "monthly", priority: 0.4 },
  ];

  // All PDF tools (exclude workflow preset URLs, which are query variants of /workflows)
  const toolRoutes: MetadataRoute.Sitemap = PDF_TOOLS.filter(isRealToolRoute).map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...toolRoutes];
}
