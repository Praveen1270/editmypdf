"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  ArrowRight,
  ShieldCheck,
  Clock,
  Info,
  Files,
  Scissors,
  Minimize2,
  PenLine,
  ChevronDown,
  Layers,
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
      className="fixed inset-0 z-50 flex flex-col bg-white/98 dark:bg-black/98 backdrop-blur-md lg:hidden animate-in fade-in duration-150"
    >
      {/* Top Bar inside Drawer */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4">
        <BrandLogo markSize={24} />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white transition hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
          >
            <X className="h-5 w-5 stroke-[2]" />
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
          className="flex w-full items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300 shadow-xs transition hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white"
        >
          <span>Find a PDF tool...</span>
          <kbd className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
            Search
          </kbd>
        </button>

        {/* Featured Quick Tool Shortcuts */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
            Quick Tools
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/merge-pdf"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-xs"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white shrink-0">
                <Files className="h-4 w-4 stroke-[2]" />
              </div>
              <span>Merge PDF</span>
            </Link>
            <Link
              href="/split-pdf"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-xs"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white shrink-0">
                <Scissors className="h-4 w-4 stroke-[2]" />
              </div>
              <span>Split PDF</span>
            </Link>
            <Link
              href="/compress-pdf"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-xs"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white shrink-0">
                <Minimize2 className="h-4 w-4 stroke-[2]" />
              </div>
              <span>Compress PDF</span>
            </Link>
            <Link
              href="/edit-pdf"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-xs"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white shrink-0">
                <PenLine className="h-4 w-4 stroke-[2]" />
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
            className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-center text-black dark:text-white font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <Layers className="h-4 w-4 text-black dark:text-white stroke-[2]" />
            <span>All Tools</span>
          </Link>
          <Link
            href="/recent"
            onClick={onClose}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-center text-black dark:text-white font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <Clock className="h-4 w-4 text-black dark:text-white stroke-[2]" />
            <span>Recent</span>
          </Link>
          <Link
            href="/about"
            onClick={onClose}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-center text-black dark:text-white font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <Info className="h-4 w-4 text-black dark:text-white stroke-[2]" />
            <span>About</span>
          </Link>
        </div>

        {/* Tool Categories Directory Accordion */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Browse by Category ({PDF_TOOLS.length} Tools)
            </h3>
          </div>

          <div className="space-y-2">
            {MASTER_CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
              const tools = PDF_TOOLS.filter((t) => getMasterCategoryId(t) === cat.id);
              const isExpanded = expandedCat === cat.id;

              return (
                <div key={cat.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                    className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                  >
                    <span>{cat.name} ({tools.length})</span>
                    <ChevronDown className={`h-4 w-4 text-black dark:text-white stroke-[2.5] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-1 border-t border-zinc-100 dark:border-zinc-800 pt-2 bg-zinc-50 dark:bg-zinc-950">
                      {tools.map((tool) => (
                        <Link
                          key={tool.id}
                          href={tool.href}
                          onClick={onClose}
                          className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition font-medium"
                        >
                          <span>{tool.name}</span>
                          <ArrowRight className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
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
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-600 dark:text-zinc-400">
          <div className="inline-flex items-center gap-1.5 font-bold text-black dark:text-white mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-black dark:text-white stroke-[2]" />
            <span>100% In-Browser Privacy</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Documents never leave your device. Processed in local memory.
          </p>
        </div>
      </div>
    </div>
  );
}
