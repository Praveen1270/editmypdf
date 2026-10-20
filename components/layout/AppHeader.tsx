"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  ChevronDown,
  Files,
  Scissors,
  Minimize2,
  FileText,
  Image,
  FileType,
  Presentation,
  FileSpreadsheet,
  Code2,
  FileCode,
  Archive,
  RotateCw,
  Hash,
  Stamp,
  Crop,
  PenLine,
  FormInput,
  Lock,
  Unlock,
  PenTool,
  Eraser,
  GitCompare,
  Sparkles,
  Languages,
  Workflow,
  Wrench,
  Layers,
  Trash2,
  FolderOutput,
  ScanLine,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";
import { MobileNavigation } from "./MobileNavigation";

interface AppHeaderProps {
  onOpenSearch: () => void;
}

const CONVERT_TO_PDF = [
  { name: "JPG to PDF", href: "/jpg-to-pdf", desc: "Convert images to PDF document", icon: Image },
  { name: "Word to PDF", href: "/word-to-pdf", desc: "Convert DOCX to formatted PDF", icon: FileType },
  { name: "PowerPoint to PDF", href: "/powerpoint-to-pdf", desc: "Convert PPTX slides to PDF", icon: Presentation },
  { name: "Excel to PDF", href: "/excel-to-pdf", desc: "Convert spreadsheets to PDF", icon: FileSpreadsheet },
  { name: "HTML to PDF", href: "/html-to-pdf", desc: "Convert web pages to PDF", icon: Code2 },
];

const CONVERT_FROM_PDF = [
  { name: "PDF to JPG", href: "/pdf-to-jpg", desc: "Extract pages as high-res images", icon: Image },
  { name: "PDF to Word", href: "/pdf-to-word", desc: "Convert PDF to editable DOCX", icon: FileType },
  { name: "PDF to PowerPoint", href: "/pdf-to-powerpoint", desc: "Convert PDF to presentation slides", icon: Presentation },
  { name: "PDF to Excel", href: "/pdf-to-excel", desc: "Extract tables to spreadsheet", icon: FileSpreadsheet },
  { name: "PDF to PDF/A", href: "/pdf-to-pdfa", desc: "ISO 19005 archival standard", icon: Archive },
];

const ALL_TOOLS_CATEGORIES = [
  {
    title: "Organize PDF",
    items: [
      { name: "Merge PDF", href: "/merge-pdf", icon: Files },
      { name: "Split PDF", href: "/split-pdf", icon: Scissors },
      { name: "Remove Pages", href: "/remove-pdf-pages", icon: Trash2 },
      { name: "Extract Pages", href: "/extract-pages", icon: FolderOutput },
      { name: "Organize PDF", href: "/organize-pdf", icon: Layers },
      { name: "Scan to PDF", href: "/scan-to-pdf", icon: ScanLine },
      { name: "Rotate PDF", href: "/rotate-pdf", icon: RotateCw },
    ],
  },
  {
    title: "Optimize PDF",
    items: [
      { name: "Compress PDF", href: "/compress-pdf", icon: Minimize2 },
      { name: "Repair PDF", href: "/repair-pdf", icon: Wrench },
      { name: "OCR PDF", href: "/ocr-pdf", icon: FileText },
    ],
  },
  {
    title: "Edit PDF",
    items: [
      { name: "Edit PDF", href: "/edit-pdf", icon: PenLine },
      { name: "Add Page Numbers", href: "/add-page-numbers", icon: Hash },
      { name: "Add Watermark", href: "/watermark-pdf", icon: Stamp },
      { name: "Crop PDF", href: "/crop-pdf", icon: Crop },
      { name: "PDF Forms", href: "/pdf-forms", icon: FormInput },
    ],
  },
  {
    title: "PDF Security",
    items: [
      { name: "Protect PDF", href: "/protect-pdf", icon: Lock },
      { name: "Unlock PDF", href: "/unlock-pdf", icon: Unlock },
      { name: "Sign PDF", href: "/sign-pdf", icon: PenTool },
      { name: "Redact PDF", href: "/redact-pdf", icon: Eraser },
      { name: "Compare PDF", href: "/compare-pdf", icon: GitCompare },
    ],
  },
  {
    title: "Intelligence & Workflows",
    items: [
      { name: "AI Summarizer", href: "/ai-summarizer", icon: Sparkles },
      { name: "Translate PDF", href: "/translate-pdf", icon: Languages },
      { name: "PDF to Markdown", href: "/pdf-to-markdown", icon: FileCode },
      { name: "Automated Workflows", href: "/workflows", icon: Workflow },
    ],
  },
];

export function AppHeader({ onOpenSearch }: AppHeaderProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [allToolsOpen, setAllToolsOpen] = useState(false);

  const convertRef = useRef<HTMLDivElement>(null);
  const allToolsRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
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

  // Close menus on escape key
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

  // Close dropdowns on route change
  useEffect(() => {
    setConvertOpen(false);
    setAllToolsOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 h-16 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-black/95 backdrop-blur-md transition-colors duration-150">
        <div className="mx-auto flex h-full max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand Logo + Desktop Nav */}
          <div className="flex items-center gap-4 lg:gap-6">
            <BrandLogo markSize={26} />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-bold" aria-label="Main Navigation">
              {/* Direct Link: Merge PDF */}
              <Link
                href="/merge-pdf"
                className={`rounded-lg px-2.5 py-1.5 transition-colors ${
                  pathname === "/merge-pdf"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Merge PDF
              </Link>

              {/* Direct Link: Split PDF */}
              <Link
                href="/split-pdf"
                className={`rounded-lg px-2.5 py-1.5 transition-colors ${
                  pathname === "/split-pdf"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Split PDF
              </Link>

              {/* Direct Link: Compress PDF */}
              <Link
                href="/compress-pdf"
                className={`rounded-lg px-2.5 py-1.5 transition-colors ${
                  pathname === "/compress-pdf"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Compress PDF
              </Link>

              {/* Dropdown: Convert PDF */}
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
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-colors ${
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
                      {/* Convert to PDF Column */}
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

                      {/* Convert from PDF Column */}
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

              {/* Mega Dropdown: All PDF Tools */}
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
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-colors ${
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

              {/* Direct Link: About */}
              <Link
                href="/about"
                className={`rounded-lg px-2.5 py-1.5 transition-colors ${
                  pathname === "/about"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
              className="flex h-9 items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 sm:px-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 transition hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
              aria-label="Find a PDF tool"
            >
              <Search className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400 stroke-[2]" />
              <span className="hidden sm:inline">Find a PDF tool</span>
              <kbd className="hidden xl:inline-flex items-center rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:text-zinc-300 ml-1">
                Ctrl K
              </kbd>
            </button>

            {/* PWA Install Action */}
            <div className="hidden sm:block">
              <InstallAppButton />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Hamburger Button */}
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

      {/* Mobile Slide-Out Drawer Navigation */}
      <MobileNavigation
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onOpenSearch={onOpenSearch}
      />
    </>
  );
}
