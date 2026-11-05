"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { HOME_FAQ_ITEMS } from "@/lib/faq";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="mt-20 pt-12 border-t border-zinc-200 dark:border-zinc-800">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-1 text-xs font-bold text-black dark:text-white mb-3 shadow-xs">
          <HelpCircle className="h-3.5 w-3.5 text-black dark:text-white stroke-[2]" />
          <span>Answers to Common Questions</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black dark:text-white">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-sm text-[#52504e] dark:text-[#d6d3d1] leading-relaxed">
          Everything you need to know about our privacy architecture, performance, and supported formats.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {HOME_FAQ_ITEMS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.q}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between p-5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              >
                <span className="font-bold text-sm sm:text-base text-black dark:text-white pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-black dark:text-white shrink-0 stroke-[2.5] transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#52504e] dark:text-[#d6d3d1] leading-relaxed border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
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
