"use client";

import React, { useState, useMemo } from "react";
import {
  MASTER_CATEGORIES,
  MasterCategoryId,
  PDF_TOOLS,
  getMasterCategoryId,
} from "@/lib/tools-data";
import { ToolCard } from "./ToolCard";

export function ToolDirectory() {
  const [selectedCategory, setSelectedCategory] = useState<MasterCategoryId>("all");

  // Filter tools based on selected category
  const displayedTools = useMemo(() => {
    if (selectedCategory === "all") {
      return PDF_TOOLS;
    }
    return PDF_TOOLS.filter((tool) => getMasterCategoryId(tool) === selectedCategory);
  }, [selectedCategory]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: PDF_TOOLS.length,
    };
    MASTER_CATEGORIES.forEach((cat) => {
      if (cat.id !== "all") {
        counts[cat.id] = PDF_TOOLS.filter((t) => getMasterCategoryId(t) === cat.id).length;
      }
    });
    return counts;
  }, []);

  return (
    <section id="tools" className="mt-8 pt-4 scroll-mt-20">
      {/* Category Filter Navigation Bar — Full-width clean horizontal tabs (No redundant search bar) */}
      <div className="mb-8">
        <div
          role="tablist"
          aria-label="PDF tool categories"
          className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none w-full"
        >
          {MASTER_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                role="tab"
                type="button"
                id={`tab-${cat.id}`}
                aria-selected={isSelected}
                aria-controls="tool-grid-panel"
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white shrink-0 ${
                  isSelected
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-black/40 dark:hover:border-white/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5-Column Responsive Tool Card Grid */}
      <div
        id="tool-grid-panel"
        role="tabpanel"
        aria-labelledby={`tab-${selectedCategory}`}
        className="w-full"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
          {displayedTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
