"use client";

import { useState } from "react";
import Link from "next/link";
import {
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
  Search,
  ShieldCheck,
  Cpu,
  UserX,
  ArrowRight,
  LockKeyhole,
  Terminal,
  X,
} from "lucide-react";
import { PDF_TOOLS, ToolCategory } from "@/lib/tools-data";

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

const CATEGORIES: { id: "all" | ToolCategory; label: string; count: number }[] = [
  { id: "all", label: "All Tools", count: 20 },
  { id: "organize", label: "Organize PDFs", count: 5 },
  { id: "convert", label: "Convert & Compress", count: 5 },
  { id: "layout", label: "Edit Page Layout", count: 5 },
  { id: "security", label: "Secure & Inspect", count: 5 },
];

export function HomeClient() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | ToolCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = PDF_TOOLS.filter((tool) => {
    const matchesCategory =
      selectedCategory === "all" || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative border-b border-border py-16 sm:py-24 bg-gradient-to-b from-muted/30 to-white">
        <div className="mx-auto max-w-content px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1 text-xs font-semibold text-foreground shadow-sm">
            <LockKeyhole className="h-3.5 w-3.5 text-success" />
            <span>Zero Server Uploads · 100% In-Browser</span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            All your PDF tools.
            <br />
            <span className="text-foreground">One private workspace.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            20 genuinely functional PDF utilities that process everything directly inside your browser. No uploads, no account required, completely free.
          </p>

          {/* Live Search Bar */}
          <div className="mx-auto mt-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all 20 tools (e.g. merge, compress, protect)..."
                className="w-full rounded-xl border border-border bg-white pl-10 pr-9 py-2.5 text-xs text-foreground placeholder-muted-foreground shadow-sm focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Guarantees */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Client-Side Memory Only</span>
            <span>·</span>
            <span>Zero Tracking Cookies</span>
            <span>·</span>
            <span>Offline Ready</span>
            <span>·</span>
            <Link href="/how-it-works" className="font-medium text-primary hover:underline">
              Verify in DevTools →
            </Link>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-16">
        <div className="mx-auto max-w-content px-4 sm:px-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pb-8 border-b border-border">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-foreground text-white shadow-sm"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`ml-1.5 text-[11px] ${active ? "opacity-90" : "opacity-60"}`}>
                    ({cat.id === "all" ? 20 : cat.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results count / active search notice */}
          {searchQuery && (
            <div className="pt-4 pb-2 text-xs text-muted-foreground">
              Showing {filteredTools.length} tools matching "<strong>{searchQuery}</strong>"
            </div>
          )}

          {/* Tools Grid */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredTools.map((tool) => {
              const Icon = ICON_MAP[tool.iconName] || Files;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative flex flex-col justify-between rounded-xl border border-border bg-white p-5 transition-all duration-200 hover:border-foreground/40 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-foreground group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-muted-foreground/80">
                        {tool.category.replace("-", " ")}
                      </span>
                    </div>

                    <h3 className="mt-3.5 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {tool.shortDesc}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-primary">
                    <span>Open tool</span>
                    <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm font-semibold text-foreground">No matching PDF tools found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try searching for another keyword or switch category filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-4 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Verification & Privacy Showcase */}
      <section className="border-t border-border bg-muted/20 py-16">
        <div className="mx-auto max-w-content px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span>Verifiable Architecture</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Engineered for Zero Data Transmission
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Unlike traditional online converters that upload your files to unknown cloud servers, PDFKit processes everything in your browser's local sandbox.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-foreground">
                1. Local Hardware Processing
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                All rendering, text parsing, and compression happen inside your device’s WebAssembly and Canvas runtime.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-foreground">
                2. Verifiable in DevTools
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Open your browser's Network tab (F12) while processing any file. You will observe exactly zero upload requests.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                <UserX className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-foreground">
                3. Total Anonymity
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                No accounts, no email requirements, no paywalls, and no tracking cookies. You remain completely private.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
