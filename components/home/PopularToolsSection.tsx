import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { POPULAR_TOOL_IDS, getToolsByIds } from "@/lib/tools-data";

export function PopularToolsSection() {
  // Names and hrefs come from the registry (POPULAR_TOOL_IDS); the display
  // name is the tool's registry name (e.g. "Images to PDF", not "JPG to PDF").
  const popularTools = getToolsByIds(POPULAR_TOOL_IDS);
  return (
    <section className="mt-20 pt-12 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-black dark:text-white stroke-[2]" />
            <span>Popular PDF Tools</span>
          </h2>
          <p className="text-xs text-[#52504e] dark:text-[#d6d3d1] mt-0.5">
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
        {popularTools.map((tool) => (
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
