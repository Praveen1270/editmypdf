"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";
import { MobileNavigation } from "./MobileNavigation";
import { PDF_TOOLS, type ToolItem } from "@/lib/tools-data";
import { getToolIcon } from "@/lib/icons";

interface AppHeaderProps {
  onOpenSearch: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  desc?: string;
  icon: ReturnType<typeof getToolIcon>;
}

function toolById(id: string): ToolItem {
  const tool = PDF_TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`AppHeader: unknown tool id "${id}"`);
  return tool;
}

// Menu labels that differ from the registry tool name; everything else uses
// the registry name. href and icon always come from the registry.
const MENU_LABELS: Record<string, string> = {
  "images-to-pdf": "JPG to PDF",
  "pdf-to-images": "PDF to JPG",
  "remove-pages": "Remove Pages",
  extract: "Extract Pages",
  organize: "Organize PDF",
  ocr: "OCR PDF",
  watermark: "Watermark PDF",
  compare: "Compare PDF",
  workflows: "Automated Workflows",
  "ai-summarizer": "AI Summarizer",
};

// Short descriptions shown in the Convert dropdown (menu copy, not registry data).
const CONVERT_DESCS: Record<string, string> = {
  "images-to-pdf": "Convert images to PDF document",
  "word-to-pdf": "Convert DOCX to formatted PDF",
  "powerpoint-to-pdf": "Convert PPTX slides to PDF",
  "excel-to-pdf": "Convert spreadsheets to PDF",
  "html-to-pdf": "Convert web pages to PDF",
  "pdf-to-images": "Extract pages as high-res images",
  "pdf-to-word": "Convert PDF to editable DOCX",
  "pdf-to-powerpoint": "Convert PDF to presentation slides",
  "pdf-to-excel": "Extract tables to spreadsheet",
};

function menuItems(ids: string[], withDesc = false): MenuItem[] {
  return ids.map((id) => {
    const tool = toolById(id);
    return {
      name: MENU_LABELS[id] ?? tool.name,
      href: tool.href,
      desc: withDesc ? CONVERT_DESCS[id] : undefined,
      icon: getToolIcon(tool.icon),
    };
  });
}

const CONVERT_TO_PDF = menuItems(
  ["images-to-pdf", "word-to-pdf", "powerpoint-to-pdf", "excel-to-pdf", "html-to-pdf"],
  true
);

const CONVERT_FROM_PDF = menuItems(
  ["pdf-to-images", "pdf-to-word", "pdf-to-powerpoint", "pdf-to-excel"],
  true
);

const ALL_TOOLS_CATEGORIES: { title: string; items: MenuItem[] }[] = [
  {
    title: "Organize PDF",
    items: menuItems(["merge", "split", "remove-pages", "extract", "organize", "scan-to-pdf", "rotate"]),
  },
  {
    title: "Optimize PDF",
    items: menuItems(["compress", "repair", "ocr"]),
  },
  {
    title: "Edit PDF",
    items: menuItems(["edit-pdf", "page-numbers", "watermark", "crop", "pdf-forms"]),
  },
  {
    title: "PDF Security",
    items: menuItems(["protect", "unlock", "sign-pdf", "redact", "compare"]),
  },
  {
    title: "Intelligence & Workflows",
    items: menuItems(["ai-summarizer", "translate-pdf", "pdf-to-markdown", "workflows"]),
  },
];

export function AppHeader({ onOpenSearch }: AppHeaderProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [allToolsOpen, setAllToolsOpen] = useState(false);

  const convertRef = useRef<HTMLDivElement>(null);
  const allToolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (convertRef.current && !convertRef.current.contains(event.target as Node)) {
        setConvertOpen(false);
      }
      if (allToolsRef.current && !allToolsRef.current.contains(event.target as Node)) {
        setAllToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setConvertOpen(false);
        setAllToolsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setConvertOpen(false);
    setAllToolsOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 h-16 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-black/95 backdrop-blur-md transition-colors duration-150">
        <div className="mx-auto flex h-full max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:gap-6">
            <BrandLogo />

            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold shrink-0" aria-label="Main Navigation">
              <Link
                href="/merge-pdf"
                className={`rounded-lg px-2.5 py-1.5 whitespace-nowrap shrink-0 transition-colors ${
                  pathname === "/merge-pdf"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Merge PDF
              </Link>

              <Link
                href="/split-pdf"
                className={`rounded-lg px-2.5 py-1.5 whitespace-nowrap shrink-0 transition-colors ${
                  pathname === "/split-pdf"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Split PDF
              </Link>

              <Link
                href="/compress-pdf"
                className={`rounded-lg px-2.5 py-1.5 whitespace-nowrap shrink-0 transition-colors ${
                  pathname === "/compress-pdf"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Compress PDF
              </Link>

              <div
                ref={convertRef}
                className="relative"
                onMouseEnter={() => setConvertOpen(true)}
                onMouseLeave={() => setConvertOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setConvertOpen((prev) => !prev)}
                  aria-expanded={convertOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 whitespace-nowrap shrink-0 transition-colors ${
                    convertOpen
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>Convert PDF</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${convertOpen ? "rotate-180" : ""}`} />
                </button>

                {convertOpen && (
                  <div
                    className="absolute left-0 top-full pt-2 z-50 w-[540px] animate-in fade-in slide-in-from-top-1 duration-150"
                    role="menu"
                  >
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xl grid grid-cols-2 gap-4">
                      <div>
                        <div className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 mb-2">
                          Convert to PDF
                        </div>
                        <div className="space-y-1">
                          {CONVERT_TO_PDF.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition group text-left"
                                role="menuitem"
                              >
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white shrink-0 mt-0.5">
                                  <Icon className="h-4 w-4 stroke-[2]" />
                                </div>
                                <div>
                                  <div className="font-bold text-xs text-black dark:text-white transition-colors">
                                    {item.name}
                                  </div>
                                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                    {item.desc}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 mb-2">
                          Convert from PDF
                        </div>
                        <div className="space-y-1">
                          {CONVERT_FROM_PDF.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition group text-left"
                                role="menuitem"
                              >
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white shrink-0 mt-0.5">
                                  <Icon className="h-4 w-4 stroke-[2]" />
                                </div>
                                <div>
                                  <div className="font-bold text-xs text-black dark:text-white transition-colors">
                                    {item.name}
                                  </div>
                                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                    {item.desc}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div
                ref={allToolsRef}
                className="relative"
                onMouseEnter={() => setAllToolsOpen(true)}
                onMouseLeave={() => setAllToolsOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setAllToolsOpen((prev) => !prev)}
                  aria-expanded={allToolsOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 whitespace-nowrap shrink-0 transition-colors ${
                    allToolsOpen
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>All PDF Tools</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${allToolsOpen ? "rotate-180" : ""}`} />
                </button>

                {allToolsOpen && (
                  <div
                    className="absolute -left-32 top-full pt-2 z-50 w-[780px] animate-in fade-in slide-in-from-top-1 duration-150"
                    role="menu"
                  >
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xl grid grid-cols-5 gap-4">
                      {ALL_TOOLS_CATEGORIES.map((cat) => (
                        <div key={cat.title}>
                          <div className="pb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 mb-2">
                            {cat.title}
                          </div>
                          <div className="space-y-1">
                            {cat.items.map((tool) => {
                              const Icon = tool.icon;
                              return (
                                <Link
                                  key={tool.href}
                                  href={tool.href}
                                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition group text-left"
                                  role="menuitem"
                                >
                                  <Icon className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors shrink-0 stroke-[2]" />
                                  <span className="text-xs font-medium text-black dark:text-white transition-colors truncate">
                                    {tool.name}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/about"
                className={`rounded-lg px-2.5 py-1.5 whitespace-nowrap shrink-0 transition-colors ${
                  pathname === "/about"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                About
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex h-9 items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 transition hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white shrink-0 whitespace-nowrap"
              aria-label="Find a PDF tool"
            >
              <Search className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400 stroke-[2]" />
              <span className="hidden sm:inline whitespace-nowrap">Find a PDF tool</span>
              <kbd className="hidden xl:inline-flex items-center rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:text-zinc-300 ml-1 shrink-0 whitespace-nowrap">
                Ctrl K
              </kbd>
            </button>

            <div className="hidden sm:block">
              <InstallAppButton />
            </div>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white lg:hidden transition hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
              aria-label="Open mobile menu"
            >
              <Menu className="h-5 w-5 stroke-[2]" />
            </button>
          </div>
        </div>
      </header>

      <MobileNavigation
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onOpenSearch={onOpenSearch}
      />
    </>
  );
}
