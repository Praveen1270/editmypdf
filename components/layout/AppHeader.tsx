"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";
import { MobileNavigation } from "./MobileNavigation";

interface AppHeaderProps {
  onOpenSearch: () => void;
}

export function AppHeader({ onOpenSearch }: AppHeaderProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/#tools") return pathname === "/" || pathname === "";
    return pathname === path;
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 w-full border-b border-border bg-surface/90 backdrop-blur-md transition-colors duration-150">
        <div className="mx-auto flex h-full max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand Logo & Wordmark + Desktop Nav Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            <BrandLogo markSize={26} />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/#tools"
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  pathname === "/"
                    ? "text-foreground font-semibold bg-surface-subtle"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-subtle/60"
                }`}
              >
                All tools
              </Link>
              <Link
                href="/recent"
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  pathname === "/recent"
                    ? "text-foreground font-semibold bg-surface-subtle"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-subtle/60"
                }`}
              >
                Recent
              </Link>
              <Link
                href="/about"
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  pathname === "/about"
                    ? "text-foreground font-semibold bg-surface-subtle"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-subtle/60"
                }`}
              >
                About
              </Link>
            </nav>
          </div>

          {/* Right: Search, Theme Toggle, Install Action, Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Compact Search Trigger */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 sm:px-3 text-xs sm:text-sm text-muted-foreground transition hover:border-border-strong hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Find a PDF tool"
            >
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="hidden sm:inline">Find a PDF tool</span>
              <kbd className="hidden lg:inline-flex items-center rounded border border-border bg-surface-subtle px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground ml-1">
                Ctrl K
              </kbd>
            </button>

            {/* Subtle PWA Install Action */}
            <div className="hidden sm:block">
              <InstallAppButton />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground md:hidden transition hover:bg-surface-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open mobile menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Drawer */}
      <MobileNavigation
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onOpenSearch={onOpenSearch}
      />
    </>
  );
}
