import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { FAQ_ITEMS } from "@/lib/faq";

export const metadata: Metadata = generatePageMetadata({
  title: "Frequently Asked Questions — EditMyPDF",
  description:
    "Answers to common questions about client-side PDF processing, zero server uploads, file size limits, browser compatibility, and security.",
  canonical: "/faq",
  keywords: ["editmypdf faq", "pdf privacy questions", "offline pdf faq"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  // JSON-LD derives from the same list the FAQ page renders (lib/faq.ts),
  // so the schema and the visible answers can no longer drift apart.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
