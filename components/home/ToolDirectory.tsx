"use client";

import React, { useState, useMemo } from "react";
import {
  MASTER_CATEGORIES,
  MasterCategoryId,
  PDF_TOOLS,
  ToolItem,
  getMasterCategoryId,
} from "@/lib/tools-data";
import { ToolCard } from "./ToolCard";
import { GlobalToolSearch } from "./GlobalToolSearch";
import { Search, Sparkles } from "lucide-react";

export function ToolDirectory() {
  const [selectedCategory, setSelectedCategory] = useState<MasterCategoryId>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tools based on category and search query
  const displayedTools = useMemo(() => {
    let list = PDF_TOOLS;

    // Filter by category if not 'all'
    if (selectedCategory !== "all") {
      list = list.filter((tool) => getMasterCategoryId(tool) === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (tool) =>
          tool.name.toLowerCase().includes(q) ||
          tool.shortDesc.toLowerCase().includes(q) ||
          tool.categoryName.toLowerCase().includes(q) ||
          tool.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

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
      {/* Category Filter Navigation Bar & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Horizontal Category Filter Pills */}
        <div
          role="tablist"
          aria-label="PDF tool categories"
          className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none w-full md:max-w-3xl"
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
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery("");
                }}
                className={`relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-background/20 text-background"
                      : "bg-surface-subtle text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Filter Search Input */}
        <div className="w-full md:w-64 shrink-0">
          <GlobalToolSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            onSubmit={() => {}}
          />
        </div>
      </div>

      {/* Search status notification if active */}
      {searchQuery.trim() && (
        <div className="flex items-center justify-between mb-4 px-1 text-xs text-muted-foreground">
          <span>
            Found <strong>{displayedTools.length}</strong> tools matching &ldquo;{searchQuery}&rdquo;
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-accent hover:underline font-medium"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* 5-Column Responsive Tool Card Grid */}
      <div
        id="tool-grid-panel"
        role="tabpanel"
        aria-labelledby={`tab-${selectedCategory}`}
        className="w-full"
      >
        {displayedTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
            {displayedTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-paper">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-subtle text-muted-foreground mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">No tools found</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn&apos;t find any tools matching &ldquo;{searchQuery}&rdquo; in this category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-subtle transition shadow-sm"
            >
              Reset to All Tools
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
