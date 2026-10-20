"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "Is EditMyPDF really 100% free with no limits?",
    a: "Yes. All tools on EditMyPDF are completely free to use. There are no subscriptions, paywalls, watermarks, trial periods, or artificial daily conversion limits.",
  },
  {
    q: "Are my PDF files uploaded to any servers?",
    a: "No. All PDF processing happens locally in your browser's RAM memory using JavaScript and WebAssembly. Your documents are never sent across the internet to our servers or any third-party APIs.",
  },
  {
    q: "How does in-browser PDF editing and conversion work?",
    a: "Modern web browsers are capable of running powerful WebAssembly binaries and high-performance JavaScript engines (pdf-lib, pdf.js, fontkit, Tesseract.js). We load the processing libraries onto your browser once, and your computer's CPU processes the files locally.",
  },
  {
    q: "What is the maximum file size I can edit or convert?",
    a: "Since processing takes place in your local computer memory, the practical limit is determined by your device's available RAM. Most modern computers and smartphones can effortlessly handle files between 100MB and 200MB. For maximum browser stability, we recommend files under 150MB.",
  },
  {
    q: "Can I use EditMyPDF on mobile phones and tablets?",
    a: "Yes. EditMyPDF is fully responsive and supports all modern mobile browsers on iOS and Android. You can also install it as a Progressive Web App (PWA) to your home screen for one-tap access.",
  },
  {
    q: "Does EditMyPDF work offline?",
    a: "Yes. Once the web application and tools are cached by your browser's service worker, the core PDF processing utilities can operate completely offline without an active internet connection.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="mt-20 pt-12 border-t border-border">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent mb-3">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Answers to Common Questions</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Everything you need to know about our privacy architecture, performance, and supported formats.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.q}
              className="rounded-2xl border border-border bg-surface overflow-hidden shadow-paper transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between p-5 text-left transition hover:bg-surface-subtle"
              >
                <span className="font-bold text-sm sm:text-base text-foreground pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-accent" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 bg-surface-subtle/20 animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
