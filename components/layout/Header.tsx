"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { CATEGORIES, PDF_TOOLS } from "@/lib/tools-data";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close menus on route change
  useEffect(() => {
    setToolsOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Click outside to close tools dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    }
    if (toolsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toolsOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface-base/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-content items-center justify-between px-3 sm:px-6">
        {/* Brand Logo & Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-md"
        >
          {/* Monochrome Folded Document Mark */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-black text-white shadow-sm">
            <img
              src="/logo.png?v=2"
              alt="PDFKit Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-foreground">
            PDF<span className="font-semibold text-text-secondary">Kit</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-text-secondary">
          {/* Tools Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-text-primary transition hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              aria-expanded={toolsOpen}
              aria-haspopup="true"
            >
              <span>All Tools</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${toolsOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mega Dropdown */}
            {toolsOpen && (
              <div className="absolute left-1/2 top-full mt-2 w-[720px] -translate-x-1/2 rounded-2xl border border-border bg-surface-base p-6 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="grid grid-cols-4 gap-6">
                  {CATEGORIES.map((cat) => (
                    <div key={cat.id} className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border pb-1.5">
                        {cat.name}
                      </h4>
                      <ul className="space-y-1.5 text-xs">
                        {PDF_TOOLS.filter((t) => t.category === cat.id).map((tool) => (
                          <li key={tool.id}>
                            <Link
                              href={tool.href}
                              className="block rounded-md px-2 py-1 text-text-secondary transition hover:bg-surface-raised hover:text-text-primary font-medium truncate"
                            >
                              {tool.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                  <span className="flex items-center gap-1.5 text-text-primary font-medium">
                    <Shield className="h-3.5 w-3.5" />
                    All 20 tools run 100% locally in your browser
                  </span>
                  <Link href="/#tools" className="font-semibold text-text-primary hover:underline flex items-center gap-1">
                    <span>View all tools grid</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/about" className="transition hover:text-text-primary">
            About
          </Link>
          <Link href="/faq" className="transition hover:text-text-primary">
            FAQ
          </Link>
          <Link href="/privacy-policy" className="flex items-center gap-1.5 transition hover:text-text-primary">
            <Shield className="h-3.5 w-3.5 text-text-primary" />
            <span>Privacy</span>
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle (Light / Dark) */}
          <ThemeToggle />

          {/* Install App Button */}
          <InstallAppButton />

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-base text-text-primary transition hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-focus lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-14 bottom-0 z-50 overflow-y-auto bg-surface-base p-4 shadow-xl lg:hidden animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-6 pb-12">
            {/* Quick Links & Mobile Theme Switch */}
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <Link
                href="/about"
                className="flex items-center justify-center rounded-lg border border-border bg-surface-raised p-2.5 text-text-primary hover:bg-surface-strong"
              >
                About
              </Link>
              <Link
                href="/privacy-policy"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-raised p-2.5 text-text-primary hover:bg-surface-strong"
              >
                <Shield className="h-3.5 w-3.5 text-text-primary" />
                <span>Privacy</span>
              </Link>
              <Link
                href="/faq"
                className="flex items-center justify-center rounded-lg border border-border bg-surface-raised p-2.5 text-text-primary hover:bg-surface-strong"
              >
                FAQ
              </Link>
              <Link
                href="/how-it-works"
                className="flex items-center justify-center rounded-lg border border-border bg-surface-raised p-2.5 text-text-primary hover:bg-surface-strong"
              >
                How It Works
              </Link>
            </div>

            {/* All 20 Tools by Category */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                All 20 PDF Tools
              </h3>

              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="rounded-xl border border-border p-3 bg-surface-raised">
                  <h4 className="text-xs font-bold text-text-primary mb-2">
                    {cat.name}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {PDF_TOOLS.filter((t) => t.category === cat.id).map((tool) => (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        className="rounded-lg px-2.5 py-1.5 text-xs text-text-primary hover:bg-surface-strong transition flex items-center justify-between"
                      >
                        <span className="font-medium">{tool.name}</span>
                        <ArrowRight className="h-3 w-3 text-text-tertiary" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional info links */}
            <div className="border-t border-border pt-4 flex flex-wrap gap-4 text-xs text-text-secondary">
              <Link href="/terms" className="hover:text-text-primary">Terms</Link>
              <Link href="/contact" className="hover:text-text-primary">Contact</Link>
              <Link href="/security" className="hover:text-text-primary">Security</Link>
              <Link href="/disclaimer" className="hover:text-text-primary">Disclaimer</Link>
              <Link href="/cookie-policy" className="hover:text-text-primary">Cookie Policy</Link>
              <Link href="/accessibility" className="hover:text-text-primary">Accessibility</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
