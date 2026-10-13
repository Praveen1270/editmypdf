"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Star,
  ChevronRight,
  Search,
  BookOpen,
  HelpCircle,
  Info,
  ShieldCheck,
  Mail,
  Download,
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
  Share2,
} from "lucide-react";
import {
  PDF_TOOLS,
  SIDEBAR_CATEGORIES,
  SidebarCategoryId,
  ToolItem,
} from "@/lib/tools-data";
import { getStarredToolIds, toggleStarredToolId } from "@/lib/storage";

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

const CATEGORY_ICONS: Record<SidebarCategoryId, any> = {
  "scan-workflow": Binary,
  "page-management": LayoutGrid,
  "edit-annotate": Type,
  "create-convert-pdf": FileImage,
  "convert-other": FileText,
  "security-privacy": Lock,
  "collaborate-share": Share2,
};

interface SidebarProps {
  onOpenSearch: () => void;
  onOpenInstall: () => void;
  onCloseMobileDrawer?: () => void;
}

export function Sidebar({
  onOpenSearch,
  onOpenInstall,
  onCloseMobileDrawer,
}: SidebarProps) {
  const pathname = usePathname();

  // State to manage expanded tool categories
  // By default, expand "page-management" so tools are immediately visible
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "page-management": true,
  });

  const [starredIds, setStarredIds] = useState<string[]>([]);

  useEffect(() => {
    setStarredIds(getStarredToolIds());
    const handleStarredUpdate = () => {
      setStarredIds(getStarredToolIds());
    };
    window.addEventListener("pdfkit_starred_updated", handleStarredUpdate);
    return () => window.removeEventListener("pdfkit_starred_updated", handleStarredUpdate);
  }, []);

  const handleToggleStar = (e: React.MouseEvent, toolId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStarredToolId(toolId);
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleLinkClick = () => {
    if (onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  // Dynamically calculate tool counts per category based on actual available tools
  const toolsByCategory = React.useMemo(() => {
    const map: Record<string, ToolItem[]> = {};
    for (const cat of SIDEBAR_CATEGORIES) {
      map[cat.id] = PDF_TOOLS.filter((t) => t.sidebarCategory === cat.id);
    }
    return map;
  }, []);

  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground select-none border-r border-sidebar-border">
      {/* 1. Top Branding */}
      <div className="p-5 pb-3">
        <Link
          href="/"
          onClick={handleLinkClick}
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-lg"
        >
          {/* Monochrome logo: updated with uploaded logo image */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-black text-white shadow-sm transition group-hover:opacity-90">
            <img
              src="/logo.png?v=2"
              alt="PDFKit Logo"
              className="h-full w-full object-cover"
            />
          </div>
          {/* Brand Name */}
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground font-sans">
            PDFKit
          </span>
        </Link>
      </div>

      {/* 2. Compact Sidebar Search */}
      <div className="px-5 py-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="group flex w-full items-center justify-between rounded-xl border border-sidebar-border bg-sidebar-accent/50 px-3 py-2 text-xs text-sidebar-foreground transition hover:border-sidebar-ring hover:bg-sidebar-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          aria-label="Search tools"
        >
          <div className="flex items-center gap-2.5">
            <Search className="h-3.5 w-3.5 text-sidebar-foreground/60 group-hover:text-sidebar-foreground transition-colors" />
            <span className="text-sidebar-foreground/70 group-hover:text-sidebar-foreground">Search Tools</span>
          </div>
          <kbd className="inline-flex items-center rounded border border-sidebar-border bg-sidebar px-1.5 py-0.5 text-[10px] font-mono font-medium text-sidebar-foreground/70 group-hover:text-sidebar-foreground">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Scrollable Navigation Center */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        {/* 3. Primary Navigation */}
        <nav aria-label="Primary navigation" className="space-y-1">
          <Link
            href="/"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              pathname === "/"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/recent"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              pathname === "/recent"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Recent Files</span>
          </Link>

          <Link
            href="/starred"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              pathname === "/starred"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <Star className="h-4 w-4" />
            <span>Starred</span>
          </Link>
        </nav>

        {/* 4. Tools Navigation with Expandable Categories */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-sidebar-foreground/50">
              Tools
            </h2>
          </div>

          <div className="space-y-0.5">
            {SIDEBAR_CATEGORIES.map((category) => {
              const tools = toolsByCategory[category.id] || [];
              const isExpanded = !!expandedCategories[category.id];
              const CategoryIcon = CATEGORY_ICONS[category.id] || Files;

              return (
                <div key={category.id} className="rounded-lg overflow-hidden">
                  {/* Category Header Row */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium text-sidebar-foreground/75 transition hover:bg-sidebar-accent hover:text-sidebar-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CategoryIcon className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/60" />
                      <span className="truncate">{category.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {/* Dynamic tool count */}
                      <span className="text-[11px] font-mono font-medium text-sidebar-foreground/60">
                        {tools.length}
                      </span>
                      {/* Right-facing chevron rotating when expanded */}
                      <ChevronRight
                        className={`h-3.5 w-3.5 text-sidebar-foreground/50 transition-transform duration-200 ${
                          isExpanded ? "rotate-90 text-sidebar-foreground" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded Tools List */}
                  {isExpanded && (
                    <div className="ml-3 pl-3 border-l border-sidebar-border/80 my-1 space-y-0.5 animate-in fade-in-50 duration-150">
                      {tools.length > 0 ? (
                        tools.map((tool) => {
                          const ToolIcon = ICON_MAP[tool.iconName] || Files;
                          const isActive = pathname === tool.href;
                          const isStarred = starredIds.includes(tool.id);

                          return (
                            <div
                              key={tool.id}
                              className={`group/tool flex items-center justify-between rounded-md transition ${
                                isActive
                                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground font-normal"
                              }`}
                            >
                              <Link
                                href={tool.href}
                                onClick={handleLinkClick}
                                className="flex items-center gap-2 px-2.5 py-1.5 text-xs truncate flex-1 min-w-0"
                              >
                                <ToolIcon className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/60" />
                                <span className="truncate">{tool.name}</span>
                              </Link>
                              <button
                                type="button"
                                onClick={(e) => handleToggleStar(e, tool.id)}
                                aria-label={isStarred ? `Unstar ${tool.name}` : `Star ${tool.name}`}
                                title={isStarred ? "Unstar tool" : "Star tool"}
                                className={`p-1 mr-1.5 rounded transition ${
                                  isStarred
                                    ? "opacity-100 text-sidebar-foreground"
                                    : "opacity-0 group-hover/tool:opacity-60 hover:!opacity-100 text-sidebar-foreground/50 hover:text-sidebar-foreground"
                                }`}
                              >
                                <Star
                                  className={`h-3 w-3 ${
                                    isStarred ? "fill-current" : ""
                                  }`}
                                />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-2.5 py-1 text-[11px] text-sidebar-foreground/50 italic">
                          No tools available yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Resources Section */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-sidebar-foreground/50">
              Resources
            </h2>
          </div>

          <nav aria-label="Resources" className="space-y-0.5">
            <Link
              href="/how-it-works"
              onClick={handleLinkClick}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs transition ${
                pathname === "/how-it-works"
                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-sidebar-foreground/60" />
              <span>How It Works</span>
            </Link>

            <Link
              href="/faq"
              onClick={handleLinkClick}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs transition ${
                pathname === "/faq"
                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5 text-sidebar-foreground/60" />
              <span>FAQ</span>
            </Link>

            <Link
              href="/about"
              onClick={handleLinkClick}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs transition ${
                pathname === "/about"
                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <Info className="h-3.5 w-3.5 text-sidebar-foreground/60" />
              <span>About</span>
            </Link>

            <Link
              href="/privacy-policy"
              onClick={handleLinkClick}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs transition ${
                pathname === "/privacy-policy"
                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-sidebar-foreground/60" />
              <span>Security & Privacy</span>
            </Link>

            <Link
              href="/contact"
              onClick={handleLinkClick}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs transition ${
                pathname === "/contact"
                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <Mail className="h-3.5 w-3.5 text-sidebar-foreground/60" />
              <span>Contact</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* 6. Sidebar Bottom Actions (Pinned & Visible) */}
      <div className="shrink-0 border-t border-sidebar-border p-3 bg-sidebar">
        <button
          type="button"
          onClick={onOpenInstall}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-sidebar-foreground/75 transition hover:bg-sidebar-accent hover:text-sidebar-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring"
        >
          <Download className="h-4 w-4 text-sidebar-foreground/60" />
          <span>Install App</span>
        </button>
      </div>
    </aside>
  );
}
