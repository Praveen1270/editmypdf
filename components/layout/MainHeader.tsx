"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { PDF_TOOLS } from "@/lib/tools-data";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface MainHeaderProps {
  onToggleMobileDrawer: () => void;
  onOpenSearch?: () => void;
}

export function MainHeader({ onToggleMobileDrawer }: MainHeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname === "/recent") return "Recent Files";
    if (pathname === "/starred") return "Starred";

    const matchedTool = PDF_TOOLS.find((t) => t.href === pathname);
    if (matchedTool) return matchedTool.name;

    if (pathname === "/about") return "About";
    if (pathname === "/faq") return "FAQ";
    if (pathname === "/how-it-works") return "How It Works";
    if (pathname === "/privacy" || pathname === "/privacy-policy") return "Privacy Policy";
    if (pathname === "/security") return "Security";
    if (pathname === "/terms") return "Terms of Service";
    if (pathname === "/contact") return "Contact";
    if (pathname === "/disclaimer") return "Disclaimer";
    if (pathname === "/cookie-policy") return "Cookie Policy";
    if (pathname === "/accessibility") return "Accessibility";

    return "Dashboard";
  };

  const title = getPageTitle();

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-card/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger + Top Bar Logo & Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          type="button"
          onClick={onToggleMobileDrawer}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-foreground transition hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Top Bar Branding: Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition hover:opacity-90"
        >
          <img
            src="/logo.png?v=2"
            alt="EditMyPDF Logo"
            className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 object-contain"
          />
          <span className="text-sm sm:text-base font-bold tracking-tight text-foreground font-sans">
            EditMyPDF
          </span>
        </Link>

        {/* Separator & Current Page Title */}
        <span className="text-muted-foreground/30 text-sm select-none">/</span>
        <h1 className="text-sm font-semibold tracking-tight text-foreground sm:text-base font-sans truncate">
          {title}
        </h1>
      </div>

      {/* Right: Quick actions & indicators */}
      <div className="flex items-center gap-2">
        {/* Theme mode toggle button */}
        <ThemeToggle />
      </div>
    </header>
  );
}
