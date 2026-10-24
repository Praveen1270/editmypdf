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
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "EditMyPDF — Privacy-First PDF Tools",
      },
    ],
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

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Praveen",
    url: "https://editmypdf.co.in",
    jobTitle: "Independent developer",
    description: "EditMyPDF is a free, browser-based PDF toolkit built and maintained by Praveen, an independent developer in Hyderabad, India.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hyderabad",
      addressCountry: "IN",
    },
  };

  return (
    <>
      <WebsiteJsonLd />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <HomeClient />
      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            About EditMyPDF
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            EditMyPDF is a free, browser-based PDF toolkit built and maintained by Praveen, an independent developer in Hyderabad, India. Merge, compress, convert and edit PDFs for anyone, anywhere. Files are processed locally on your device, so your documents are not uploaded to a server.
          </p>
        </div>
      </section>
    </>
  );
}
