import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Permanent redirects for consolidated/removed routes
  async redirects() {
    return [
      { source: "/edit-pdf-text", destination: "/edit-pdf", permanent: true },
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/jpg-to-pdf", destination: "/images-to-pdf", permanent: true },
      { source: "/pdf-to-jpg", destination: "/pdf-to-images", permanent: true },
      { source: "/compare-pdf", destination: "/compare-pdfs", permanent: true },
      { source: "/extract-pages", destination: "/extract-pdf-pages", permanent: true },
      { source: "/extract-pages/", destination: "/extract-pdf-pages", permanent: true },
    ];
  },
  // Ensure strict privacy headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    // Avoid bundling node-canvas which is only an optional pdfjs fallback in node
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
