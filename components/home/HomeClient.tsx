"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Star,
  ArrowRight,
  ShieldCheck,
  Files,
  Scissors,
  LayoutGrid,
  RotateCw,
  FolderOutput,
  Minimize2,
  Image,
  FileImage,
  FileText,
  Palette,
  Hash,
  Stamp,
  Type,
  Crop,
  Maximize,
  Lock,
  Unlock,
  FileSliders,
  Binary,
  GitCompare,
} from "lucide-react";
import { PDF_TOOLS, ToolItem } from "@/lib/tools-data";
import {
  getStarredToolIds,
  toggleStarredToolId,
} from "@/lib/storage";

const ICON_MAP: Record<string, any> = {
  Files,
  Scissors,
  LayoutGrid,
  RotateCw,
  FolderOutput,
  Minimize2,
  Image,
  FileImage,
  FileText,
  Palette,
  Hash,
  Stamp,
  Type,
  Crop,
  Maximize,
  Lock,
  Unlock,
  FileSliders,
  Binary,
  GitCompare,
};

const START_WITH_IDS = [
  "merge",
  "split",
  "compress",
  "images-to-pdf",
  "pdf-to-images",
  "organize",
  "rotate",
  "protect",
  "pdf-to-text",
];

export function HomeClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load and listen for starred tool updates
  useEffect(() => {
    setStarredIds(getStarredToolIds());
    const handleStarredUpdate = () => {
      setStarredIds(getStarredToolIds());
    };
    window.addEventListener("editmypdf_starred_updated", handleStarredUpdate);
    return () => window.removeEventListener("editmypdf_starred_updated", handleStarredUpdate);
  }, []);

  // Keyboard shortcut: Ctrl + K focuses the main search bar on Dashboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleStar = (e: React.MouseEvent, toolId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStarredToolId(toolId);
  };

  const startWithTools = START_WITH_IDS.map((id) =>
    PDF_TOOLS.find((t) => t.id === id)
  ).filter(Boolean) as ToolItem[];

  const filteredTools = PDF_TOOLS.filter((tool) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.shortDesc.toLowerCase().includes(q) ||
      tool.categoryName.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredTools.length > 0) {
      router.push(filteredTools[0].href);
    }
  };

  return (
    <div className="bg-background text-foreground font-sans pb-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-8 py-10 sm:py-16">
        {/* 4. Dashboard Hero Section */}
        <section className="text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Free Online PDF Tools
          </h1>
          <p className="mt-3.5 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed font-normal">
            Merge, split, compress, convert, and manage PDFs instantly in your browser. Free to use, no watermark, no sign-up required.
          </p>
        </section>

        {/* 5. Main Search Bar */}
        <section className="mt-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-3xl">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Tools"
                className="w-full rounded-2xl border border-border bg-card py-3.5 pl-12 pr-24 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition hover:border-ring focus:border-ring focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="absolute right-4 flex items-center gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-muted-foreground hover:text-foreground transition"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <kbd className="inline-flex items-center rounded-md border border-border bg-secondary px-2 py-1 text-[11px] font-mono font-medium text-muted-foreground">
                  Ctrl K
                </kbd>
              </div>
            </div>
          </form>
        </section>

        {/* Search Results vs Normal State */}
        {searchQuery.trim() !== "" ? (
          <section className="mt-12">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Search Results ({filteredTools.length})
              </h2>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear search
              </button>
            </div>

            {filteredTools.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool) => {
                  const Icon = ICON_MAP[tool.iconName] || Files;
                  const isStarred = starredIds.includes(tool.id);

                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 min-h-[160px] transition-all duration-150 hover:border-ring hover:bg-accent shadow-sm cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="h-5 w-5" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(e, tool.id)}
                          aria-label={isStarred ? "Unstar tool" : "Star tool"}
                          className="p-1 text-muted-foreground hover:text-foreground transition"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              isStarred
                                ? "fill-foreground text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-base font-bold text-card-foreground">
                          {tool.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {tool.shortDesc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-sm font-semibold text-foreground">No tools found matching "{searchQuery}"</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try another keyword or browse the sidebar categories.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 rounded-lg border border-border bg-secondary px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
                >
                  Reset Search
                </button>
              </div>
            )}
          </section>
        ) : (
          /* Normal State: 6. "Start with" Section */
          <>
            <section className="mt-12">
              <div className="mb-4">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Start with
                </h2>
              </div>

              {/* Grid of Large Tool Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {startWithTools.map((tool, idx) => {
                  const Icon = ICON_MAP[tool.iconName] || Files;
                  const isStarred = starredIds.includes(tool.id);
                  const isFeaturedFirst = idx === 0;

                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className={`group relative flex flex-col justify-between rounded-2xl p-6 min-h-[160px] sm:min-h-[170px] transition-all duration-150 shadow-sm cursor-pointer ${
                        isFeaturedFirst
                          ? "bg-primary text-primary-foreground border border-primary hover:opacity-95"
                          : "bg-card text-card-foreground border border-border hover:border-ring hover:bg-accent"
                      }`}
                    >
                      {/* Top Row: Icon container + Star button */}
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                            isFeaturedFirst
                              ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground"
                              : "bg-secondary border-border text-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(e, tool.id)}
                          aria-label={isStarred ? "Unstar tool" : "Star tool"}
                          className={`p-1.5 rounded-lg transition ${
                            isFeaturedFirst
                              ? "text-primary-foreground/60 hover:text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              isStarred
                                ? isFeaturedFirst
                                  ? "fill-primary-foreground text-primary-foreground"
                                  : "fill-foreground text-foreground"
                                : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Lower Portion: Clear Tool Name & Description */}
                      <div className="mt-8">
                        <h3
                          className={`text-base sm:text-lg font-bold tracking-tight ${
                            isFeaturedFirst ? "text-primary-foreground" : "text-card-foreground"
                          }`}
                        >
                          {tool.name}
                        </h3>
                        <p
                          className={`mt-1 text-xs leading-relaxed ${
                            isFeaturedFirst
                              ? "text-primary-foreground/75"
                              : "text-muted-foreground"
                          }`}
                        >
                          {tool.shortDesc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Additional "All Tools" Library */}
            <section className="mt-16 border-t border-border pt-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    All PDF Tools
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    All 20 client-side utilities run locally in your browser memory.
                  </p>
                </div>
                <span className="text-xs font-mono font-medium text-muted-foreground">
                  20 Tools Available
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {PDF_TOOLS.map((tool) => {
                  const Icon = ICON_MAP[tool.iconName] || Files;
                  const isStarred = starredIds.includes(tool.id);

                  return (
                    <div
                      key={tool.id}
                      className="group flex items-start justify-between rounded-xl border border-border bg-card p-3.5 transition hover:border-ring hover:bg-accent"
                    >
                      <Link
                        href={tool.href}
                        className="flex items-start gap-3 min-w-0 flex-1"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary text-foreground shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-0.5">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 pr-1">
                          <span className="text-xs font-semibold text-foreground block">
                            {tool.name}
                          </span>
                          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                            {tool.shortDesc}
                          </p>
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => handleToggleStar(e, tool.id)}
                        aria-label={isStarred ? `Unstar ${tool.name}` : `Star ${tool.name}`}
                        title={isStarred ? "Unstar tool" : "Star tool"}
                        className={`p-1.5 rounded-lg transition shrink-0 ml-1.5 ${
                          isStarred
                            ? "text-foreground"
                            : "opacity-0 group-hover:opacity-70 hover:!opacity-100 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            isStarred ? "fill-foreground text-foreground" : ""
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Verifiable Architecture Guarantee Banner */}
        <section className="mt-16 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-theme">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  100% In-Browser & Private Guarantee
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your files never leave your device. All operations happen in volatile client-side RAM.
                </p>
              </div>
            </div>

            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition shrink-0"
            >
              <span>Verify in DevTools</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
