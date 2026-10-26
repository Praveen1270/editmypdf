import React from "react";
import { PDF_TOOLS } from "@/lib/tools-data";
import { SITE_CONFIG } from "@/lib/site-config";

interface ToolJsonLdProps {
  toolId: string;
}

export function ToolJsonLd({ toolId }: ToolJsonLdProps) {
  const tool = PDF_TOOLS.find((t) => t.id === toolId);
  if (!tool) return null;

  const baseUrl = SITE_CONFIG.url;
  const toolUrl = `${baseUrl}${tool.href}`;

  const schemas: any[] = [
    // 1. WebApplication Schema
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": `${tool.name} — ${SITE_CONFIG.name}`,
      "url": toolUrl,
      "description": tool.description,
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "All modern web browsers",
      "browserRequirements": "Requires JavaScript and WebAssembly support",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "featureList": tool.features,
    },
    // 2. BreadcrumbList Schema
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl,
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": tool.categoryName,
          "item": `${baseUrl}/#${tool.category}`,
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": tool.name,
          "item": toolUrl,
        },
      ],
    },
  ];

  // 3. FAQPage Schema
  if (tool.faq && tool.faq.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": tool.faq.map((item) => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a,
        },
      })),
    });
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

export function WebsiteJsonLd() {
  const baseUrl = SITE_CONFIG.url;
  const siteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_CONFIG.name,
    "url": baseUrl,
    "description": SITE_CONFIG.description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_CONFIG.name,
    "url": baseUrl,
    "logo": SITE_CONFIG.logoSvgUrl,
    "sameAs": [SITE_CONFIG.githubUrl],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": SITE_CONFIG.contactEmail,
      "contactType": "Customer Support",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </>
  );
}
