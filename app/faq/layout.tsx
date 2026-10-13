import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Frequently Asked Questions — PDFKit",
  description:
    "Answers to common questions about client-side PDF processing, zero server uploads, file size limits, browser compatibility, and security.",
  canonical: "/faq",
  keywords: ["pdfkit faq", "pdf privacy questions", "offline pdf faq"],
});

const FAQ_ITEMS = [
  {
    q: "Are my PDF files uploaded to any server or cloud storage?",
    a: "Never. All document operations happen entirely on your computer or mobile device inside your browser's local runtime. Neither your files, extracted text, or passwords are ever transmitted over the network.",
  },
  {
    q: "How can I independently verify that files stay on my device?",
    a: "Open your browser Developer Tools (F12 or Cmd+Option+I), navigate to the Network tab, and process any file. You will observe zero POST or upload requests. You can also turn off your internet connection completely after loading the page and the tools will still function.",
  },
  {
    q: "What are the file size limits?",
    a: "There are no arbitrary software limits imposed by PDFKit. Because processing relies on client-side RAM, documents up to several hundred megabytes process smoothly on most modern laptops and desktops.",
  },
  {
    q: "Which browsers are supported?",
    a: "PDFKit is compatible with all modern standards-compliant web browsers supporting WebAssembly and the HTML5 File API, including Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge on desktop, tablet, and mobile.",
  },
  {
    q: "What encryption standard does Protect PDF use?",
    a: "We utilize industry-standard AES-256 bit encryption (PDF 2.0 / ISO 32000-2) and AES-128 via the native Web Crypto API. The resulting protected files are fully compatible with Adobe Acrobat, Apple Preview, Google Chrome, and standard PDF readers.",
  },
  {
    q: "Can I use PDFKit completely offline?",
    a: "Yes. Once the initial application scripts and PDF worker are loaded into your browser cache, you can disconnect Wi-Fi or enable Airplane Mode and all 20 PDF utilities will continue working offline.",
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
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
