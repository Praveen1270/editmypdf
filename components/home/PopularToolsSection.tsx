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
  { name: "Remove Pages", href: "/remove-pdf-pages", },
  { name: "Rotate PDF", href: "/rotate-pdf" },
  { name: "PDF to Markdown", href: "/pdf-to-markdown" },
  { name: "Workflows", href: "/workflows" },
];

export function PopularToolsSection() {
  return (
    <section className="mt-20 pt-12 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Popular PDF Tools</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quick direct access to our most frequently used document utilities.
          </p>
        </div>
        <Link
          href="/#tools"
          className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
        >
          <span>View all tools</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {POPULAR_TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-medium text-foreground hover:border-accent/40 hover:bg-surface-subtle transition shadow-sm"
          >
            {tool.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
