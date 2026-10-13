"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface FaqItem {
  q: string;
  a: string;
  category: "privacy" | "technical" | "tools" | "security";
}

const FAQ_DATA: FaqItem[] = [
  {
    category: "privacy",
    q: "Are my PDF files uploaded to any server or cloud storage?",
    a: "Never. All document operations happen entirely on your computer or mobile device inside your browser's local runtime. Neither your files, extracted text, or passwords are ever transmitted over the network.",
  },
  {
    category: "privacy",
    q: "How can I independently verify that files stay on my device?",
    a: "Open your browser Developer Tools (F12 or Cmd+Option+I), navigate to the Network tab, and process any file. You will observe zero POST or upload requests. You can also turn off your internet connection completely after loading the page and the tools will still function.",
  },
  {
    category: "technical",
    q: "What are the file size limits?",
    a: "There are no arbitrary software limits imposed by PDFKit. Because processing relies on client-side RAM, documents up to several hundred megabytes process smoothly on most modern laptops and desktops. Mobile devices with limited RAM may experience memory constraints with extremely large files.",
  },
  {
    category: "technical",
    q: "Which browsers are supported?",
    a: "PDFKit is compatible with all modern standards-compliant web browsers supporting WebAssembly and the HTML5 File API, including Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge on desktop, tablet, and mobile.",
  },
  {
    category: "tools",
    q: "Why did PDF to Text return no text from my document?",
    a: "If your PDF was created by scanning physical paper with an office scanner or photo app without OCR (Optical Character Recognition), the document contains only bitmap pictures of pages. Text extraction requires selectable digital characters. Pure image scans require OCR software.",
  },
  {
    category: "tools",
    q: "How does the local PDF compression tool work?",
    a: "Our compression engine eliminates duplicate structural objects, optimizes cross-reference streams, and re-encodes oversized embedded raster graphics at calibrated resolutions. We report honest before-and-after measurements and never display fabricated savings.",
  },
  {
    category: "security",
    q: "What encryption standard does Protect PDF use?",
    a: "We utilize industry-standard AES-256 bit encryption (PDF 2.0 / ISO 32000-2) and AES-128 via the native Web Crypto API. The resulting protected files are fully compatible with Adobe Acrobat, Apple Preview, Google Chrome, and standard PDF readers.",
  },
  {
    category: "security",
    q: "Can Unlock PDF recover a forgotten password?",
    a: "No. PDFKit is designed to decrypt PDFs when you know the legitimate document password. We do not support password cracking or bypassing security controls.",
  },
  {
    category: "technical",
    q: "Can I use PDFKit completely offline?",
    a: "Yes. Once the initial application scripts and PDF worker are loaded into your browser cache, you can disconnect Wi-Fi or enable Airplane Mode and all 20 PDF utilities will continue working offline.",
  },
  {
    category: "privacy",
    q: "Do I need an account or subscription to use PDFKit?",
    a: "No. PDFKit requires no account, email address, registration, or credit card. All 20 tools are completely free to use without restrictions.",
  },
];

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQ_DATA.filter(
    (item) =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="border-b border-border pb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
            <span>Knowledge Base</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Everything you need to know about local browser PDF processing, security standards, file compatibility, and technical capabilities.
          </p>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions (e.g. privacy, compression, offline)..."
              className="w-full rounded-xl border border-border pl-10 pr-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-10 max-w-3xl mx-auto space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No matching questions found for "{search}".
            </div>
          ) : (
            filteredFaqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-white shadow-sm overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left font-semibold text-foreground text-sm hover:bg-muted/10"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-border bg-muted/10 px-5 py-4 text-xs text-muted-foreground leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact Footer */}
        <div className="mt-16 text-center text-xs text-muted-foreground border-t border-border pt-8 max-w-xl mx-auto">
          Still have a question? Visit our{" "}
          <Link href="/contact" className="text-primary hover:underline font-semibold">
            Contact & Support Page
          </Link>{" "}
          or inspect how our architecture works on the{" "}
          <Link href="/how-it-works" className="text-primary hover:underline font-semibold">
            How It Works Page
          </Link>.
        </div>
      </div>
    </div>
  );
}
