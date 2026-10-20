import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const POPULAR_TOOLS = [
  { name: "Merge PDF", href: "/merge-pdf" },
  { name: "Split PDF", href: "/split-pdf" },
  { name: "Compress PDF", href: "/compress-pdf" },
  { name: "Edit PDF", href: "/edit-pdf" },
  { name: "PDF to Word", href: "/pdf-to-word" },
  { name: "Word to PDF", href: "/word-to-pdf" },
  { name: "JPG to PDF", href: "/jpg-to-pdf" },
  { name: "PDF to JPG", href: "/pdf-to-jpg" },
  { name: "Sign PDF", href: "/sign-pdf" },
  { name: "Protect PDF", href: "/protect-pdf" },
  { name: "Unlock PDF", href: "/unlock-pdf" },
  { name: "OCR PDF", href: "/ocr-pdf" },
  { name: "Remove Pages", href: "/remove-pdf-pages" },
  { name: "Rotate PDF", href: "/rotate-pdf" },
  { name: "PDF to Markdown", href: "/pdf-to-markdown" },
  { name: "Workflows", href: "/workflows" },
];

export function PopularToolsSection() {
  return (
    <section className="mt-20 pt-12 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-black dark:text-white stroke-[2]" />
            <span>Popular PDF Tools</span>
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Quick direct access to our most frequently used document utilities.
          </p>
        </div>
        <Link
          href="/#tools"
          className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1"
        >
          <span>View all tools</span>
          <ArrowRight className="h-3 w-3 stroke-[2.5]" />
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {POPULAR_TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs font-medium text-black dark:text-white hover:border-black dark:hover:border-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition shadow-xs"
          >
            {tool.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
