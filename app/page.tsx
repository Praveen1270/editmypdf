import type { Metadata } from "next";
import { HomeClient } from "@/components/home/HomeClient";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Free PDF Tools Online – Edit, Convert & Compress PDFs | EditMyPDF",
  description:
    "Merge, split, compress, convert, edit, and organize PDF files for free. Process supported documents directly in your browser with no account or file upload required.",
  keywords: [
    "PDF tools",
    "edit PDF text",
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
    description: "39 functional PDF tools that run locally in your browser. Files never leave your device.",
    type: "website",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "EditMyPDF",
    "url": "https://editmypdf.co.in",
      "description": "Privacy-first suite of 22 browser-powered PDF utilities operating with zero server uploads.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All modern web browsers",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Edit PDF",
      "Edit PDF Text",
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
