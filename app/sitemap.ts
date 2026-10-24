import { MetadataRoute } from "next";
import { PDF_TOOLS } from "@/lib/tools-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://editmypdf.co.in";

  // Core informational pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/` },
    { url: `${baseUrl}/about` },
    { url: `${baseUrl}/privacy-policy` },
    { url: `${baseUrl}/terms` },
    { url: `${baseUrl}/contact` },
    { url: `${baseUrl}/disclaimer` },
    { url: `${baseUrl}/cookie-policy` },
    { url: `${baseUrl}/faq` },
    { url: `${baseUrl}/how-it-works` },
    { url: `${baseUrl}/security` },
    { url: `${baseUrl}/accessibility` },
  ];

  // All PDF tools (exclude workflow preset URLs, which are query variants of /workflows)
  const toolRoutes: MetadataRoute.Sitemap = PDF_TOOLS.filter((tool) => !tool.href.includes("?")).map((tool) => ({
    url: `${baseUrl}${tool.href}`,
  }));

  const now = new Date();
  return [...staticRoutes, ...toolRoutes].map((r) => ({
    ...r,
    lastModified: now,
  }));
}
