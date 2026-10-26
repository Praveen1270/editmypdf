import { PDF_TOOLS, ToolItem } from "@/lib/tools-data";
import { TOOL_CONTENT } from "@/lib/tool-content";
import { SITE_CONFIG } from "@/lib/site-config";
import { buildMarkdownPage, formatList, formatTable, toAbsoluteUrl } from "./format";

export interface MarkdownRouteMeta {
  path: string; // e.g. "/" or "/compress-pdf"
  url: string; // https://editmypdf.co.in/compress-pdf
  mdUrl: string; // https://editmypdf.co.in/compress-pdf.md
  title: string;
  description: string;
  category: "core" | "informational" | "tool" | "legal";
  inLlmsFull: boolean;
}

export interface RenderedPage {
  markdown: string;
  canonical: string;
}

// Helper to normalize route path (e.g. "/compress-pdf.md" -> "/compress-pdf", "index" -> "/")
export function normalizePath(rawPath: string): string {
  let clean = rawPath.trim();
  if (!clean.startsWith("/")) clean = "/" + clean;
  if (clean.endsWith(".md")) clean = clean.slice(0, -3);
  if (clean === "/index" || clean === "") clean = "/";
  // Remove trailing slash if not root
  if (clean.length > 1 && clean.endsWith("/")) clean = clean.slice(0, -1);
  return clean;
}

// ----------------------------------------------------
// Page Renderers
// ----------------------------------------------------

function renderHomePage(): RenderedPage {
  const toolsByCategory: Record<string, ToolItem[]> = {};
  for (const tool of PDF_TOOLS) {
    if (tool.href.includes("?")) continue; // skip query variants
    const cat = tool.categoryName || "Other Tools";
    if (!toolsByCategory[cat]) toolsByCategory[cat] = [];
    toolsByCategory[cat].push(tool);
  }

  let content = `## Overview

EditMyPDF is a private, client-side PDF utility platform designed to solve common document manipulation tasks directly within your browser. Unlike traditional online converters, files are processed entirely in local device memory using WebAssembly and Web Workers. Your files are never uploaded to remote servers or cloud storage.

## Key Principles
- **100% Client-Side Processing**: Document rendering, merging, splitting, OCR, and compression execute inside your browser thread or Web Worker.
- **Zero Data Retention**: No files, text, metadata, or telemetry are ever uploaded or retained on remote servers.
- **No Account or Subscription Required**: All 57 tools are completely free to use without signing up.
- **Offline Capable**: Works offline after initial loading as a Progressive Web App (PWA).

## PDF Utility Catalog by Category
`;

  for (const [catName, tools] of Object.entries(toolsByCategory)) {
    content += `\n### ${catName}\n\n`;
    for (const tool of tools) {
      content += `- [${tool.name}](${toAbsoluteUrl(tool.href)}) - ${tool.shortDesc || tool.description}\n`;
    }
  }

  content += `\n## Supported Document Workflows
- Merging, splitting, rotating, extracting, and reordering pages.
- Client-side compression and grayscale conversion to reduce file size.
- Document conversions: PDF to Images, Images to PDF, Word/Excel/CSV to PDF, Markdown to PDF, and HTML to PDF.
- Security operations: AES-256 encryption, password removal, redaction, and metadata stripping.
- Editing & annotation: Text insertion, custom watermarks, page numbering, and digital signature drawing.
`;

  const related = [
    { title: "How It Works (Technical Overview)", href: "/how-it-works" },
    { title: "Security & Privacy Model", href: "/security" },
    { title: "Frequently Asked Questions", href: "/faq" },
  ];

  return {
    markdown: buildMarkdownPage({
      title: `${SITE_CONFIG.name} — Free, Privacy-First Online PDF Tools`,
      description: SITE_CONFIG.description,
      canonicalPath: "/",
      content,
      related,
    }),
    canonical: toAbsoluteUrl("/"),
  };
}

function renderAboutPage(): RenderedPage {
  const content = `## Our Mission
EditMyPDF was created to provide a fast, trustworthy, and private alternative to conventional PDF utility websites. Most commercial PDF websites require uploading sensitive documents—such as tax returns, contracts, invoices, and medical records—to remote servers where they may be stored, indexed, or analyzed.

EditMyPDF eliminates the server entirely for document processing. All operations happen inside the user's browser using modern JavaScript, WebAssembly, and local device computing.

## Key Facts
- **Founded**: ${SITE_CONFIG.foundingYear}
- **Author/Developer**: ${SITE_CONFIG.author}
- **Contact**: [${SITE_CONFIG.contactEmail}](mailto:${SITE_CONFIG.contactEmail})
- **Source Code / Repository**: [${SITE_CONFIG.githubUrl}](${SITE_CONFIG.githubUrl})
- **Pricing**: 100% Free. No subscriptions, credits, or watermarks on output files.
- **Architecture**: Single Page Application powered by Next.js and client-side WebAssembly/PDF engines.

## Why Client-Side Processing Matters
When sensitive documents leave your device, you risk data exposure, privacy compliance violations (e.g. GDPR, HIPAA), and unvetted third-party storage. EditMyPDF executes all byte manipulations on your CPU, keeping your confidential data safely on your machine.
`;

  return {
    markdown: buildMarkdownPage({
      title: "About EditMyPDF — Privacy-First PDF Tools",
      description:
        "Learn about EditMyPDF: an open, privacy-first PDF utility suite designed with minimal design and zero cloud dependencies.",
      canonicalPath: "/about",
      content,
      related: [
        { title: "Security Architecture", href: "/security" },
        { title: "How It Works", href: "/how-it-works" },
      ],
    }),
    canonical: toAbsoluteUrl("/about"),
  };
}

function renderHowItWorksPage(): RenderedPage {
  const content = `## Technical Architecture

Traditional online PDF tools operate on a client-server paradigm: you upload your PDF to their server, a remote backend worker parses and modifies the file, and you download the result from their cloud.

EditMyPDF utilizes a **local execution model**:

1. **File Selection**: When you drop a file into EditMyPDF, the browser opens an \`ArrayBuffer\` or \`Blob\` in browser memory. No network transfer occurs.
2. **Local Processing**:
   - PDF manipulation (merging, splitting, rotating, encrypting) is executed using client-side WebAssembly and compiled PDF runtimes (such as \`pdf-lib\` and Web Worker threads).
   - Conversions (such as Excel to PDF, Images to PDF, Markdown to PDF) occur directly within browser memory using client-side parsing libraries.
   - Text extraction and OCR run locally using in-browser WebAssembly engines.
3. **Instant Download**: The modified bytes are packaged into a downloadable \`Blob\` and saved directly to your local file system via browser download APIs.
4. **Memory Cleanup**: As soon as you navigate away or refresh, the memory buffers are cleared by the browser's garbage collector.
`;

  return {
    markdown: buildMarkdownPage({
      title: "How EditMyPDF Works — Local In-Browser Processing",
      description:
        "Understand how EditMyPDF manipulates PDF documents directly within your browser without sending bytes to external servers.",
      canonicalPath: "/how-it-works",
      content,
      related: [
        { title: "Security Model", href: "/security" },
        { title: "Browse All Tools", href: "/" },
      ],
    }),
    canonical: toAbsoluteUrl("/how-it-works"),
  };
}

function renderSecurityPage(): RenderedPage {
  const content = `## Zero Server Upload Guarantee
At EditMyPDF, privacy is not a policy setting—it is built into our core architecture. The application is technically incapable of viewing, storing, or leaking your files because it contains no backend upload endpoints.

## Technical Security Safeguards
- **Zero File Uploads**: Network requests inspectable in browser DevTools confirm that document payloads are never sent across the network.
- **Client-Side AES-256 Encryption**: Password protection operations apply industry-standard AES-256 encryption directly on the client.
- **Strict Content Security & Isolation**: Pages are served with \`X-Content-Type-Options: nosniff\`, \`X-Frame-Options: DENY\`, and strict referrer headers.
- **No Tracking of Document Contents**: Analytics and telemetry only measure high-level aggregate page views; no document names, text, sizes, or metadata are ever recorded.
`;

  return {
    markdown: buildMarkdownPage({
      title: "Security & Privacy Architecture — EditMyPDF",
      description:
        "Detailed breakdown of EditMyPDF's client-side security architecture and zero-transmission privacy guarantees.",
      canonicalPath: "/security",
      content,
      related: [
        { title: "Privacy Policy", href: "/privacy-policy" },
        { title: "How It Works", href: "/how-it-works" },
      ],
    }),
    canonical: toAbsoluteUrl("/security"),
  };
}

function renderFaqPage(): RenderedPage {
  const faqs = [
    {
      q: "Are my files uploaded to your servers?",
      a: "No. All PDF operations run locally inside your browser using JavaScript and WebAssembly. Your files never leave your device.",
    },
    {
      q: "Is EditMyPDF really free?",
      a: "Yes. All 57 tools are 100% free with no hidden fees, subscriptions, or watermarks added to your documents.",
    },
    {
      q: "What is the maximum file size limit?",
      a: "Because processing happens locally in your device's memory, file size limits depend on your computer or phone's available RAM and browser limits rather than a server quota. Most modern devices comfortably handle files of several hundred megabytes.",
    },
    {
      q: "Can I use EditMyPDF offline?",
      a: "Yes. EditMyPDF is configured as a Progressive Web App (PWA). Once loaded, the utility engine runs without an active internet connection.",
    },
    {
      q: "Which browsers are supported?",
      a: "All modern evergreen browsers including Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, and mobile browsers on iOS and Android.",
    },
  ];

  let content = "## Frequently Asked Questions\n\n";
  for (const item of faqs) {
    content += `### ${item.q}\n${item.a}\n\n`;
  }

  return {
    markdown: buildMarkdownPage({
      title: "Frequently Asked Questions — EditMyPDF",
      description:
        "Common questions and answers regarding file privacy, browser compatibility, pricing, and offline capabilities on EditMyPDF.",
      canonicalPath: "/faq",
      content,
      related: [
        { title: "About EditMyPDF", href: "/about" },
        { title: "Security & Privacy", href: "/security" },
      ],
    }),
    canonical: toAbsoluteUrl("/faq"),
  };
}

function renderContactPage(): RenderedPage {
  const content = `## Contact Information

We welcome bug reports, feature requests, and feedback directly from users.

- **Developer / Founder**: Praveen
- **Primary Email**: [${SITE_CONFIG.contactEmail}](mailto:${SITE_CONFIG.contactEmail})
- **GitHub Repository & Issues**: [${SITE_CONFIG.githubUrl}](${SITE_CONFIG.githubUrl})

If you encounter an issue with a specific PDF format or have suggestions for new client-side utilities, please reach out via email or open an issue on GitHub.
`;

  return {
    markdown: buildMarkdownPage({
      title: "Contact & Support — EditMyPDF",
      description: "Get in touch with the creator of EditMyPDF for feedback, bug reports, or feature requests.",
      canonicalPath: "/contact",
      content,
      related: [{ title: "About EditMyPDF", href: "/about" }],
    }),
    canonical: toAbsoluteUrl("/contact"),
  };
}

function renderPrivacyPolicyPage(): RenderedPage {
  const content = `## Privacy Policy Overview
Last updated: 2026-10-26

EditMyPDF is built on the principle of minimal data collection. We believe your documents belong to you and should never be exposed to third-party servers.

### 1. Document Processing
- All document processing occurs client-side in your web browser.
- Files uploaded into the web interface are read into local browser memory only.
- No documents, file names, text contents, or metadata are transmitted to our servers or any third-party infrastructure.

### 2. Local Storage
EditMyPDF uses browser \`localStorage\` solely to preserve user preferences (such as light/dark mode theme selection) and temporary local tool history (\`/recent\` and \`/starred\`). This data stays strictly on your machine and is never synced to a cloud backend.

### 3. Analytics
We collect aggregate, non-personally identifiable metrics (such as page visits and broad browser types) to ensure server reliability and detect performance regressions. We never log file contents or parameters.

### 4. Third-Party Services
We do not sell, rent, or monetize your data. No third-party advertising trackers are integrated into the application.
`;

  return {
    markdown: buildMarkdownPage({
      title: "Privacy Policy — EditMyPDF",
      description: "Official privacy policy detailing zero server file uploads, no tracking of document contents, and local data handling.",
      canonicalPath: "/privacy-policy",
      content,
      related: [
        { title: "Security Architecture", href: "/security" },
        { title: "Terms of Service", href: "/terms" },
      ],
    }),
    canonical: toAbsoluteUrl("/privacy-policy"),
  };
}

function renderTermsPage(): RenderedPage {
  const content = `## Terms of Service
Last updated: 2026-10-26

By accessing and using EditMyPDF ("the Service"), you agree to the following terms:

### 1. License and Permitted Use
The Service is provided free of charge for personal, educational, and commercial document editing. You may use all available tools to process documents that you have lawful rights to view and modify.

### 2. Disclaimer of Warranties
The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranty of any kind, express or implied. While our client-side algorithms are tested thoroughly, you are responsible for maintaining backups of all original documents prior to processing.

### 3. Limitation of Liability
In no event shall the authors or copyright holders of EditMyPDF be liable for any claim, damages, data loss, or other liability arising from the use of or inability to use the Service.
`;

  return {
    markdown: buildMarkdownPage({
      title: "Terms of Service — EditMyPDF",
      description: "Terms and conditions governing the use of EditMyPDF's free client-side PDF utilities.",
      canonicalPath: "/terms",
      content,
      related: [
        { title: "Privacy Policy", href: "/privacy-policy" },
        { title: "Disclaimer", href: "/disclaimer" },
      ],
    }),
    canonical: toAbsoluteUrl("/terms"),
  };
}

function renderDisclaimerPage(): RenderedPage {
  const content = `## Disclaimer

The information and software utilities provided on EditMyPDF are for general document processing purposes only.

- **No Legal or Financial Advice**: Invoice generation, contract merging, or document redaction tools do not constitute legal or financial counsel. Users are responsible for verifying compliance with applicable statutory guidelines.
- **Client Device Performance**: Conversion and processing performance is directly dependent on client device hardware capabilities (RAM, CPU speed).
`;

  return {
    markdown: buildMarkdownPage({
      title: "Disclaimer — EditMyPDF",
      description: "Legal disclaimer regarding utility tools and document processing on EditMyPDF.",
      canonicalPath: "/disclaimer",
      content,
      related: [{ title: "Terms of Service", href: "/terms" }],
    }),
    canonical: toAbsoluteUrl("/disclaimer"),
  };
}

function renderCookiePolicyPage(): RenderedPage {
  const content = `## Cookie Policy

EditMyPDF does not use tracking cookies, advertising cookies, or cross-site profiling technologies.

### Local Browser Storage
Instead of cookies, the application utilizes HTML5 \`localStorage\` exclusively for:
- Saving interface preferences (such as light / dark theme mode).
- Storing locally favorited tools (\`/starred\`) and recent local history (\`/recent\`).

This information never leaves your device and can be cleared at any time via your browser's data settings.
`;

  return {
    markdown: buildMarkdownPage({
      title: "Cookie Policy — EditMyPDF",
      description: "Information regarding our strict no-cookie policy and local browser storage usage.",
      canonicalPath: "/cookie-policy",
      content,
      related: [{ title: "Privacy Policy", href: "/privacy-policy" }],
    }),
    canonical: toAbsoluteUrl("/cookie-policy"),
  };
}

function renderAccessibilityPage(): RenderedPage {
  const content = `## Accessibility Commitment

EditMyPDF is committed to digital accessibility and designing web applications that are usable by all individuals, including people with disabilities.

### Standards & Features
- Keyboard navigation support across tool drop zones, buttons, and control panels.
- Semantic HTML markup with accessible ARIA landmarks.
- High-contrast visual modes and dark/light theme options adhering to WCAG 2.1 AA color contrast standards.
- Responsive scaling on mobile devices and screen magnifiers without breaking layout.
`;

  return {
    markdown: buildMarkdownPage({
      title: "Accessibility Statement — EditMyPDF",
      description: "Our commitment to digital accessibility, keyboard navigation, and WCAG standards.",
      canonicalPath: "/accessibility",
      content,
      related: [{ title: "About EditMyPDF", href: "/about" }],
    }),
    canonical: toAbsoluteUrl("/accessibility"),
  };
}

// ----------------------------------------------------
// Tool Page Renderer
// ----------------------------------------------------

function renderToolPage(tool: ToolItem): RenderedPage {
  const enriched = TOOL_CONTENT[tool.id];

  const intro = enriched?.intro || tool.description;
  const steps = enriched?.steps || tool.steps.map((s) => `${s.title}: ${s.desc}`);
  const features = tool.features && tool.features.length > 0 ? tool.features : [];
  const limitations = enriched?.notes || tool.limitations || [];
  const faqs = enriched?.faqs || tool.faq || [];

  let content = `## About ${tool.name}\n\n${intro}\n\n`;

  if (steps.length > 0) {
    content += `## How to Use\n\n`;
    content += formatList(steps, true) + "\n\n";
  }

  if (features.length > 0) {
    content += `## Features\n\n`;
    content += formatList(features) + "\n\n";
  }

  if (limitations.length > 0) {
    content += `## Considerations & Limitations\n\n`;
    content += formatList(limitations) + "\n\n";
  }

  if (faqs.length > 0) {
    content += `## Frequently Asked Questions\n\n`;
    for (const faq of faqs) {
      content += `### ${faq.q}\n${faq.a}\n\n`;
    }
  }

  content += `## Privacy & Processing Guarantee\nAll processing takes place 100% locally in your web browser. Your document is never uploaded to any server.\n`;

  // Related tools in the same category
  const sameCategoryTools = PDF_TOOLS.filter(
    (t) => t.id !== tool.id && t.category === tool.category && !t.href.includes("?")
  ).slice(0, 5);

  const related = sameCategoryTools.map((t) => ({
    title: t.name,
    href: t.href,
  }));

  const rendered = buildMarkdownPage({
    title: `${tool.name} — Free & Private Online PDF Tool`,
    description: tool.description,
    canonicalPath: tool.href,
    content,
    related,
  });

  return {
    markdown: rendered,
    canonical: toAbsoluteUrl(tool.href),
  };
}

// ----------------------------------------------------
// Registry Mapping & Route Resolution
// ----------------------------------------------------

export function renderRoute(rawPath: string): RenderedPage | null {
  const path = normalizePath(rawPath);

  switch (path) {
    case "/":
      return renderHomePage();
    case "/about":
      return renderAboutPage();
    case "/how-it-works":
      return renderHowItWorksPage();
    case "/security":
      return renderSecurityPage();
    case "/faq":
      return renderFaqPage();
    case "/contact":
      return renderContactPage();
    case "/privacy-policy":
      return renderPrivacyPolicyPage();
    case "/terms":
      return renderTermsPage();
    case "/disclaimer":
      return renderDisclaimerPage();
    case "/cookie-policy":
      return renderCookiePolicyPage();
    case "/accessibility":
      return renderAccessibilityPage();
    default: {
      // Find matching tool
      const tool = PDF_TOOLS.find((t) => {
        if (t.href.includes("?")) return false;
        return normalizePath(t.href) === path;
      });
      if (tool) {
        return renderToolPage(tool);
      }
      return null;
    }
  }
}

// ----------------------------------------------------
// Route Listing for Catalog & llms.txt
// ----------------------------------------------------

export function listMarkdownRoutes(): MarkdownRouteMeta[] {
  const coreRoutes: MarkdownRouteMeta[] = [
    {
      path: "/",
      url: toAbsoluteUrl("/"),
      mdUrl: toAbsoluteUrl("/index.md"),
      title: "Home",
      description: "Overview of EditMyPDF and complete directory of 57 browser-based PDF utilities.",
      category: "core",
      inLlmsFull: true,
    },
    {
      path: "/about",
      url: toAbsoluteUrl("/about"),
      mdUrl: toAbsoluteUrl("/about.md"),
      title: "About EditMyPDF",
      description: "Background, architecture, founder information, and client-side processing philosophy.",
      category: "informational",
      inLlmsFull: true,
    },
    {
      path: "/how-it-works",
      url: toAbsoluteUrl("/how-it-works"),
      mdUrl: toAbsoluteUrl("/how-it-works.md"),
      title: "How It Works",
      description: "Technical explanation of browser memory processing, WebAssembly runtimes, and zero-upload mechanics.",
      category: "informational",
      inLlmsFull: true,
    },
    {
      path: "/security",
      url: toAbsoluteUrl("/security"),
      mdUrl: toAbsoluteUrl("/security.md"),
      title: "Security & Privacy Model",
      description: "Technical safeguards, AES-256 encryption, zero data retention, and browser sandboxing.",
      category: "informational",
      inLlmsFull: true,
    },
    {
      path: "/faq",
      url: toAbsoluteUrl("/faq"),
      mdUrl: toAbsoluteUrl("/faq.md"),
      title: "Frequently Asked Questions",
      description: "Answers to common inquiries on file limits, device memory, privacy, and free usage.",
      category: "informational",
      inLlmsFull: true,
    },
    {
      path: "/contact",
      url: toAbsoluteUrl("/contact"),
      mdUrl: toAbsoluteUrl("/contact.md"),
      title: "Contact",
      description: "Developer contact email and GitHub repository details.",
      category: "informational",
      inLlmsFull: true,
    },
    {
      path: "/privacy-policy",
      url: toAbsoluteUrl("/privacy-policy"),
      mdUrl: toAbsoluteUrl("/privacy-policy.md"),
      title: "Privacy Policy",
      description: "Formal privacy statement guaranteeing zero file uploads and no tracking of document data.",
      category: "legal",
      inLlmsFull: true,
    },
    {
      path: "/terms",
      url: toAbsoluteUrl("/terms"),
      mdUrl: toAbsoluteUrl("/terms.md"),
      title: "Terms of Service",
      description: "Permitted use, warranty disclaimers, and terms governing client-side document processing.",
      category: "legal",
      inLlmsFull: true,
    },
    {
      path: "/disclaimer",
      url: toAbsoluteUrl("/disclaimer"),
      mdUrl: toAbsoluteUrl("/disclaimer.md"),
      title: "Disclaimer",
      description: "Warranty limitations and advice regarding user responsibility for document backups.",
      category: "legal",
      inLlmsFull: true,
    },
    {
      path: "/cookie-policy",
      url: toAbsoluteUrl("/cookie-policy"),
      mdUrl: toAbsoluteUrl("/cookie-policy.md"),
      title: "Cookie Policy",
      description: "Explanation of cookie-free architecture and local browser storage usage.",
      category: "legal",
      inLlmsFull: true,
    },
    {
      path: "/accessibility",
      url: toAbsoluteUrl("/accessibility"),
      mdUrl: toAbsoluteUrl("/accessibility.md"),
      title: "Accessibility Statement",
      description: "Commitment to WCAG accessibility, keyboard navigation, and inclusive design.",
      category: "informational",
      inLlmsFull: true,
    },
  ];

  // Tool routes
  const toolRoutes: MarkdownRouteMeta[] = PDF_TOOLS.filter((t) => !t.href.includes("?")).map((t) => {
    const cleanPath = normalizePath(t.href);
    return {
      path: cleanPath,
      url: toAbsoluteUrl(cleanPath),
      mdUrl: toAbsoluteUrl(`${cleanPath}.md`),
      title: t.name,
      description: t.shortDesc || t.description,
      category: "tool",
      inLlmsFull: true,
    };
  });

  return [...coreRoutes, ...toolRoutes];
}
