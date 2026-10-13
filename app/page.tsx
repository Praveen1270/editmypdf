import type { Metadata } from "next";
import { HomeClient } from "@/components/home/HomeClient";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "EditMyPDF — Free Online PDF Tools",
  description:
    "All your PDF tools. One private workspace. 20 client-side PDF utilities to merge, split, compress, extract, crop, resize, and encrypt PDFs with zero server uploads.",
  keywords: [
    "PDF tools",
    "private PDF editor",
    "merge PDF",
    "compress PDF",
    "split PDF",
    "PDF to text",
    "crop PDF",
    "resize PDF",
    "protect PDF",
    "compare PDF",
    "client-side PDF",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "EditMyPDF — Privacy-First PDF Utilities",
    description: "20 functional PDF tools that run locally in your browser. Files never leave your device.",
    type: "website",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "EditMyPDF",
    "url": "https://editmypdf.local",
    "description": "Privacy-first suite of 20 browser-powered PDF utilities operating with zero server uploads.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All modern web browsers",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Merge PDF",
      "Split PDF",
      "Organize PDF Pages",
      "Rotate PDF",
      "Extract PDF Pages",
      "Compress PDF",
      "PDF to Images",
      "Images to PDF",
      "PDF to Text",
      "PDF to Grayscale",
      "Add Page Numbers",
      "Watermark PDF",
      "Add Text to PDF",
      "Crop PDF",
      "Resize PDF Pages",
      "Protect PDF (AES-256)",
      "Unlock PDF",
      "PDF Metadata Editor",
      "PDF Page Counter & Properties",
      "Compare PDFs",
    ],
  };

  return (
    <>
      <WebsiteJsonLd />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
