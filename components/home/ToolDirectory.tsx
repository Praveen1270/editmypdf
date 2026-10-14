"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Files,
  Minimize2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  RotateCw,
  Lock,
  Search,
} from "lucide-react";
import { TOOL_CATEGORIES, PDF_TOOLS, ToolItem } from "@/lib/tools-data";
import { GlobalToolSearch } from "./GlobalToolSearch";
import { ToolCategorySection } from "./ToolCategorySection";
import { ToolListRow } from "./ToolListRow";

const FEATURED_TOOLS = [
  {
    toolId: "merge",
    badge: "Spotlight",
    title: "Merge PDF Documents",
    desc: "Combine multiple PDF files into one clean document with custom page sequences. Drag, reorder, and export losslessly in browser memory.",
    cta: "Open Merge Tool",
    icon: Files,
  },
  {
    toolId: "compress",
    badge: "Most Used",
    title: "Compress PDF Locally",
    desc: "Reduce heavy document bytes without quality loss. Choose between lossless structural cleanup and balanced raster compression.",
    cta: "Open Compress Tool",
    icon: Minimize2,
  },
];

export function ToolDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const router = useRouter();

  // Filtered tools when searching
  const filteredTools = PDF_TOOLS.filter((tool) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.shortDesc.toLowerCase().includes(q) ||
      tool.categoryName.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleSearchSubmit = () => {
    if (filteredTools.length > 0) {
      router.push(filteredTools[0].href);
    }
  };

  // Filter categories by selected category tab
  const displayCategories = TOOL_CATEGORIES.filter((cat) => {
    if (selectedCategory === "all") return true;
    return cat.id === selectedCategory;
  });

  return (
    <section id="tools" className="mt-16 pt-8 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Tool Directory
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All 20 client-side utilities organized by document task.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="w-full sm:w-72 lg:w-80">
          <GlobalToolSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            onSubmit={handleSearchSubmit}
          />
        </div>
      </div>

      {/* When Search is Active */}
      {searchQuery.trim() !== "" ? (
        <div className="rounded-2xl border border-border bg-surface shadow-paper overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-surface-subtle/50 px-5 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Search Results ({filteredTools.length})
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              Clear search
            </button>
          </div>

          {filteredTools.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredTools.map((tool) => (
                <ToolListRow
                  key={tool.id}
                  tool={tool}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-surface-subtle text-muted-foreground mb-3">
                <Search className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                No tools matching &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try searching for words like &ldquo;merge&rdquo;, &ldquo;extract&rdquo;, &ldquo;compress&rdquo;, or &ldquo;watermark&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-subtle transition"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Normal State: Asymmetric Editorial Workspace Composition */
        <div>
          {/* Category Filter Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition shrink-0 ${
                selectedCategory === "all"
                  ? "bg-foreground text-background font-semibold"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
              }`}
            >
              All tools (20)
            </button>
            {TOOL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-foreground text-background font-semibold"
                    : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
                }`}
              >
                <span>{cat.name}</span>
                <span className="ml-1.5 opacity-60">({cat.toolIds.length})</span>
              </button>
            ))}
          </div>

          {/* Asymmetric Composition: Side Spotlight + Main Structured Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Editorial Spotlight Card & Frequently Used Shortcuts (4 cols on lg) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Featured Tool Spotlight */}
              {FEATURED_TOOLS.slice(0, 1).map((feat) => {
                const tool = PDF_TOOLS.find((t) => t.id === feat.toolId);
                if (!tool) return null;
                const Icon = feat.icon;

                return (
                  <div
                    key={feat.toolId}
                    className="rounded-2xl border border-border bg-surface p-6 shadow-paper hover:shadow-paper-elevated transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 text-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent/5 px-2 py-0.5 text-[11px] font-semibold text-accent">
                        <Sparkles className="h-3 w-3" />
                        <span>{feat.badge}</span>
                      </span>
                    </div>

                    <h3 className="mt-4 text-base font-bold text-foreground">
                      {feat.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {feat.desc}
                    </p>

                    <Link
                      href={tool.href}
                      className="mt-5 inline-flex items-center justify-center gap-2 w-full rounded-lg bg-foreground text-background py-2 px-3 text-xs font-semibold hover:opacity-90 transition"
                    >
                      <span>{feat.cta}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })}

              {/* Frequently Used Quick List */}
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-paper">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Frequently Used
                </h4>
                <div className="space-y-1.5">
                  {[
                    { id: "split", name: "Split PDF", href: "/split-pdf", desc: "Extract ranges & pages" },
                    { id: "rotate", name: "Rotate PDF", href: "/rotate-pdf", desc: "Permanent orientation fix" },
                    { id: "protect", name: "Protect PDF", href: "/protect-pdf", desc: "AES-256 local encryption" },
                    { id: "pdf-to-text", name: "PDF to Text", href: "/pdf-to-text", desc: "Extract plain text streams" },
                  ].map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs hover:bg-surface-subtle transition group"
                    >
                      <div>
                        <span className="font-semibold text-foreground group-hover:text-accent transition-colors block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground block">
                          {item.desc}
                        </span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground transition-all shrink-0 ml-2" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Privacy Verifiability Callout */}
              <div className="rounded-2xl border border-border bg-surface-subtle/40 p-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground mb-1">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <span>Volatile RAM Execution</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Documents exist only in browser memory while you edit. Closing this tab clears all data immediately.
                </p>
              </div>
            </div>

            {/* Right Column: Structured Category Rows (8 cols on lg) */}
            <div className="lg:col-span-8 space-y-4">
              {displayCategories.map((category) => {
                const tools = category.toolIds
                  .map((id) => PDF_TOOLS.find((t) => t.id === id))
                  .filter(Boolean) as ToolItem[];

                return (
                  <ToolCategorySection
                    key={category.id}
                    category={category}
                    tools={tools}
                    defaultExpanded={true}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
