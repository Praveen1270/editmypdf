"use client";

import React from "react";
import Link from "next/link";
import { X, ArrowRight, Shield, Clock, Info, Wrench } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TOOL_CATEGORIES, PDF_TOOLS } from "@/lib/tools-data";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export function MobileNavigation({ isOpen, onClose, onOpenSearch }: MobileNavigationProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md md:hidden animate-in fade-in duration-150"
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
            Ctrl K
          </kbd>
        </button>

        {/* Primary Navigation Links */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Link
            href="/#tools"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3 text-foreground font-medium hover:bg-surface-subtle transition"
          >
            <Wrench className="h-4 w-4 text-accent" />
            <span>All tools</span>
          </Link>
          <Link
            href="/recent"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3 text-foreground font-medium hover:bg-surface-subtle transition"
          >
            <Clock className="h-4 w-4 text-accent" />
            <span>Recent</span>
          </Link>
          <Link
            href="/about"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3 text-foreground font-medium hover:bg-surface-subtle transition"
          >
            <Info className="h-4 w-4 text-accent" />
            <span>About</span>
          </Link>
          <Link
            href="/privacy-policy"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3 text-foreground font-medium hover:bg-surface-subtle transition"
          >
            <Shield className="h-4 w-4 text-accent" />
            <span>Privacy</span>
          </Link>
        </div>

        {/* Tool Categories Directory */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tool Directory (20 Tools)
            </h3>
          </div>

          <div className="space-y-4">
            {TOOL_CATEGORIES.map((cat) => {
              const tools = cat.toolIds
                .map((id) => PDF_TOOLS.find((t) => t.id === id))
                .filter(Boolean);

              return (
                <div key={cat.id} className="rounded-xl border border-border bg-surface p-3.5">
                  <h4 className="text-xs font-bold text-foreground mb-2">
                    {cat.name}
                  </h4>
                  <div className="space-y-1">
                    {tools.map((tool) => tool && (
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info in mobile drawer */}
        <div className="pt-4 border-t border-border text-center text-xs text-muted-foreground">
          <p>EditMyPDF · 100% Client-Side Processing</p>
          <p className="mt-1 text-[11px] text-muted-foreground/80">
            Files never leave your browser memory.
          </p>
        </div>
      </div>
    </div>
  );
}
