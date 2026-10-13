import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/offline"],
      },
      {
        userAgent: ["Googlebot", "Bingbot", "Applebot"],
        allow: "/",
        disallow: ["/offline"],
      },
    ],
    sitemap: "https://editmypdf.local/sitemap.xml",
    host: "https://editmypdf.local",
  };
}
