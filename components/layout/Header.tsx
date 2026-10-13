"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { CATEGORIES, PDF_TOOLS } from "@/lib/tools-data";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-content items-center justify-between px-3 sm:px-6">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition hover:opacity-90"
        >
          {/* Minimal Document Icon Badge */}
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm overflow-hidden">
            <svg
              className="h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="white" stroke="#2563EB" />
              <polyline points="14 2 14 8 20 8" fill="#DBEAFE" stroke="#2563EB" />
              <line x1="8" y1="13" x2="16" y2="13" stroke="#2563EB" strokeWidth="2" />
              <line x1="8" y1="17" x2="13" y2="17" stroke="#2563EB" strokeWidth="2" />
            </svg>
          </div>
          <span className="text-base sm:text-lg font-extrabold tracking-tight">
            PDF<span className="text-primary">Kit</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {/* Tools Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold transition hover:text-foreground focus:outline-none"
              aria-expanded={toolsOpen}
            >
              <span>All Tools</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mega Dropdown */}
            {toolsOpen && (
              <div className="absolute left-1/2 top-full mt-2 w-[720px] -translate-x-1/2 rounded-2xl border border-border bg-white p-6 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="grid grid-cols-4 gap-6">
                  {CATEGORIES.map((cat) => (
                    <div key={cat.id} className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground border-b border-border pb-1.5">
                        {cat.name}
                      </h4>
                      <ul className="space-y-1.5 text-xs">
                        {PDF_TOOLS.filter((t) => t.category === cat.id).map((tool) => (
                          <li key={tool.id}>
                            <Link
                              href={tool.href}
                              className="block rounded-md px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-primary font-medium truncate"
                            >
                              {tool.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-success font-medium">
                    <Shield className="h-3.5 w-3.5" />
                    All 20 tools run 100% in your browser
                  </span>
                  <Link href="/#tools" className="font-semibold text-primary hover:underline flex items-center gap-1">
                    <span>View all tools grid</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/how-it-works" className="transition hover:text-foreground">
            How It Works
          </Link>
          <Link href="/faq" className="transition hover:text-foreground">
            FAQ
          </Link>
          <Link href="/privacy-policy" className="flex items-center gap-1.5 transition hover:text-foreground">
            <Shield className="h-3.5 w-3.5 text-success" />
            <span>Privacy</span>
          </Link>
          <Link href="/about" className="transition hover:text-foreground">
            About
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Install App Button */}
          <InstallAppButton />

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition hover:bg-muted lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-14 bottom-0 z-50 overflow-y-auto bg-white p-4 shadow-xl lg:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-6 pb-12">
            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <Link
                href="/how-it-works"
                className="flex items-center justify-center rounded-lg border border-border bg-muted/30 p-2.5 text-foreground hover:bg-muted"
              >
                How It Works
              </Link>
              <Link
                href="/privacy-policy"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/30 p-2.5 text-foreground hover:bg-muted"
              >
                <Shield className="h-3.5 w-3.5 text-success" />
                <span>Privacy</span>
              </Link>
              <Link
                href="/faq"
                className="flex items-center justify-center rounded-lg border border-border bg-muted/30 p-2.5 text-foreground hover:bg-muted"
              >
                FAQ
              </Link>
              <Link
                href="/about"
                className="flex items-center justify-center rounded-lg border border-border bg-muted/30 p-2.5 text-foreground hover:bg-muted"
              >
                About
              </Link>
            </div>

            {/* All 20 Tools by Category */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                All 20 PDF Tools
              </h3>

              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="rounded-xl border border-border p-3 bg-muted/10">
                  <h4 className="text-xs font-bold text-foreground mb-2">
                    {cat.name}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {PDF_TOOLS.filter((t) => t.category === cat.id).map((tool) => (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        className="rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition flex items-center justify-between"
                      >
                        <span className="font-medium">{tool.name}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional info links */}
            <div className="border-t border-border pt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/contact" className="hover:text-foreground">Contact</Link>
              <Link href="/security" className="hover:text-foreground">Security</Link>
              <Link href="/disclaimer" className="hover:text-foreground">Disclaimer</Link>
              <Link href="/cookie-policy" className="hover:text-foreground">Cookie Policy</Link>
              <Link href="/accessibility" className="hover:text-foreground">Accessibility</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
