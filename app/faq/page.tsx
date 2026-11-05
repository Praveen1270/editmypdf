"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { FAQ_ITEMS } from "@/lib/faq";

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="border-b border-border pb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs font-semibold text-text-primary">
            <HelpCircle className="h-3.5 w-3.5 text-text-primary" />
            <span>Knowledge Base</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed">
            Everything you need to know about local browser PDF processing, security standards, file compatibility, and technical capabilities.
          </p>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions (e.g. privacy, compression, offline)..."
              className="w-full rounded-xl border border-border bg-surface-raised pl-10 pr-4 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-focus shadow-sm"
            />
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-10 max-w-3xl mx-auto space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary text-xs">
              No matching questions found for "{search}".
            </div>
          ) : (
            filteredFaqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-surface-base shadow-sm overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left font-semibold text-text-primary text-sm hover:bg-surface-raised"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-text-tertiary transition-transform duration-150 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-border bg-surface-raised/40 px-5 py-4 text-xs text-text-secondary leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact Footer */}
        <div className="mt-16 text-center text-xs text-text-secondary border-t border-border pt-8 max-w-xl mx-auto">
          Still have a question? Visit our{" "}
          <Link href="/contact" className="text-text-primary hover:underline font-semibold">
            Contact & Support Page
          </Link>{" "}
          or inspect how our architecture works on the{" "}
          <Link href="/how-it-works" className="text-text-primary hover:underline font-semibold">
            How It Works Page
          </Link>.
        </div>
      </div>
    </div>
  );
}
