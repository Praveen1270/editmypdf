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
  webpack: (config, { webpack, isServer }) => {
    // Client only: replace Node-only dynamic imports inside pptxgenjs
    // with an empty stub. They are guarded by an isNode check and never
    // run in the browser; the server build is left untouched.
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:(fs|https)$/, require("path").join(__dirname, "lib/pdf/node-stub.ts"))
      );
    }
    // Avoid bundling node-canvas which is only an optional pdfjs fallback in node
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    // pptxgenjs's browser bundle still contains Node-only dynamic imports
    // (node:fs / node:https, used only by its Node file/stream APIs).
    // Stub them out for the client build so the browser write() path can
    // be bundled; those code paths are never taken in the browser.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      https: false,
      os: false,
      path: false,
    };
    // pptxgenjs dynamically imports node:fs / node:https for its Node-only
    // APIs. Point those specifiers at an empty stub for the client build.
    const stub = require("path").join(__dirname, "lib/pdf/node-stub.ts");
    config.resolve.alias["node:fs"] = stub;
    config.resolve.alias["node:https"] = stub;
    return config;
  },
};

export default nextConfig;
