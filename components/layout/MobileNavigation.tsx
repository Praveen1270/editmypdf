"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  ArrowRight,
  Shield,
  Clock,
  Info,
  Files,
  Scissors,
  Minimize2,
  PenLine,
  ChevronDown,
  Layers,
  Wrench,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { MASTER_CATEGORIES, PDF_TOOLS, getMasterCategoryId } from "@/lib/tools-data";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export function MobileNavigation({ isOpen, onClose, onOpenSearch }: MobileNavigationProps) {
  const [expandedCat, setExpandedCat] = useState<string | null>("organize");

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md lg:hidden animate-in fade-in duration-150"
    >
      {/* Top Bar inside Drawer */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <BrandLogo markSize={24} />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition hover:bg-surface-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Navigation Body */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Quick Search Action */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenSearch();
          }}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground shadow-paper transition hover:border-border-strong hover:text-foreground"
        >
          <span>Find a PDF tool...</span>
          <kbd className="rounded border border-border bg-surface-subtle px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            Search
          </kbd>
        </button>

        {/* Featured Quick Tool Shortcuts */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
            Quick Tools
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/merge-pdf"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-3 font-semibold text-foreground hover:bg-surface-subtle transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <Files className="h-4 w-4" />
              </div>
              <span>Merge PDF</span>
            </Link>
            <Link
              href="/split-pdf"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-3 font-semibold text-foreground hover:bg-surface-subtle transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <Scissors className="h-4 w-4" />
              </div>
              <span>Split PDF</span>
            </Link>
            <Link
              href="/compress-pdf"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-3 font-semibold text-foreground hover:bg-surface-subtle transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Minimize2 className="h-4 w-4" />
              </div>
              <span>Compress PDF</span>
            </Link>
            <Link
              href="/edit-pdf"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-3 font-semibold text-foreground hover:bg-surface-subtle transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                <PenLine className="h-4 w-4" />
              </div>
              <span>Edit PDF</span>
            </Link>
          </div>
        </div>

        {/* Primary Site Links */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Link
            href="/#tools"
            onClick={onClose}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface p-2.5 text-center text-foreground font-medium hover:bg-surface-subtle transition"
          >
            <Layers className="h-4 w-4 text-accent" />
            <span>All Tools</span>
          </Link>
          <Link
            href="/recent"
            onClick={onClose}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface p-2.5 text-center text-foreground font-medium hover:bg-surface-subtle transition"
          >
            <Clock className="h-4 w-4 text-accent" />
            <span>Recent</span>
          </Link>
          <Link
            href="/about"
            onClick={onClose}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface p-2.5 text-center text-foreground font-medium hover:bg-surface-subtle transition"
          >
            <Info className="h-4 w-4 text-accent" />
            <span>About</span>
          </Link>
        </div>

        {/* Tool Categories Directory Accordion */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Browse by Category ({PDF_TOOLS.length} Tools)
            </h3>
          </div>

          <div className="space-y-2">
            {MASTER_CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
              const tools = PDF_TOOLS.filter((t) => getMasterCategoryId(t) === cat.id);
              const isExpanded = expandedCat === cat.id;

              return (
                <div key={cat.id} className="rounded-xl border border-border bg-surface overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                    className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-foreground hover:bg-surface-subtle transition"
                  >
                    <span>{cat.name} ({tools.length})</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-1 border-t border-border/50 pt-2 bg-surface-subtle/30">
                      {tools.map((tool) => (
                        <Link
                          key={tool.id}
                          href={tool.href}
                          onClick={onClose}
                          className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-surface-subtle transition"
                        >
                          <span className="font-medium">{tool.name}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="pt-4 border-t border-border text-center text-xs text-muted-foreground">
          <div className="inline-flex items-center gap-1.5 font-semibold text-foreground mb-1">
            <Shield className="h-3.5 w-3.5 text-accent" />
            <span>100% In-Browser Privacy</span>
          </div>
          <p className="text-[11px] text-muted-foreground/80">
            Documents never leave your device. Processed in local memory.
          </p>
        </div>
      </div>
    </div>
  );
}
