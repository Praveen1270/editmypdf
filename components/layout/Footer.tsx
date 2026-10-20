import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black py-14 text-sm text-[#52504e] dark:text-[#d6d3d1] transition-colors">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        {/* Main Footer Links Categorized Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Info & Privacy Guarantee Column */}
          <div className="col-span-2 pr-0 lg:pr-6">
            <BrandLogo markSize={26} />
            <p className="mt-3 text-xs leading-relaxed text-[#52504e] dark:text-[#d6d3d1] max-w-sm">
              EditMyPDF is a complete online PDF workspace for editing, organizing, converting, and managing PDF documents directly in your browser.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-black dark:text-white">
              <ShieldCheck className="h-4 w-4 text-black dark:text-white stroke-[2]" />
              <span>100% In-Browser Privacy Guarantee</span>
            </div>
            <p className="mt-1 text-[11px] text-[#52504e] dark:text-[#d6d3d1]">
              Files never leave your computer. Built with WebAssembly and Web Crypto.
            </p>

            {/* Badges */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="https://findly.tools/editmypdf?utm_source=editmypdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-opacity hover:opacity-85"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://findly.tools/badges/findly-tools-badge-light.svg"
                  alt="Featured on Findly.tools"
                  width={175}
                  height={55}
                  className="h-[36px] w-auto dark:hidden"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://findly.tools/badges/findly-tools-badge-dark.svg"
                  alt="Featured on Findly.tools"
                  width={175}
                  height={55}
                  className="hidden h-[36px] w-auto dark:block"
                />
              </a>

              <a
                href="https://www.tinyshelf.co/?ref=editmypdf.co.in"
                title="Featured on TinyShelf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-opacity hover:opacity-85"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://www.tinyshelf.co/badge/tinyshelf-badge-dark-f4d1216a.svg"
                  alt="Featured on TinyShelf"
                  width={216}
                  height={64}
                  className="h-[36px] w-auto"
                />
              </a>

              <a
                href="https://twelve.tools"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-opacity hover:opacity-85"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://twelve.tools/badge0-white.svg"
                  alt="Featured on Twelve Tools"
                  width={148}
                  height={40}
                  className="h-[36px] w-auto"
                />
              </a>
            </div>
          </div>

          {/* Category 1: Organize PDF */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-3">
              Organize PDF
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              <Link href="/merge-pdf" className="hover:text-black dark:hover:text-white transition-colors">Merge PDF</Link>
              <Link href="/split-pdf" className="hover:text-black dark:hover:text-white transition-colors">Split PDF</Link>
              <Link href="/remove-pdf-pages" className="hover:text-black dark:hover:text-white transition-colors">Remove Pages</Link>
              <Link href="/extract-pages" className="hover:text-black dark:hover:text-white transition-colors">Extract Pages</Link>
              <Link href="/organize-pdf" className="hover:text-black dark:hover:text-white transition-colors">Organize PDF</Link>
              <Link href="/rotate-pdf" className="hover:text-black dark:hover:text-white transition-colors">Rotate PDF</Link>
              <Link href="/scan-to-pdf" className="hover:text-black dark:hover:text-white transition-colors">Scan to PDF</Link>
            </div>
          </div>

          {/* Category 2: Optimize & Edit */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-3">
              Optimize & Edit
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              <Link href="/compress-pdf" className="hover:text-black dark:hover:text-white transition-colors">Compress PDF</Link>
              <Link href="/repair-pdf" className="hover:text-black dark:hover:text-white transition-colors">Repair PDF</Link>
              <Link href="/ocr-pdf" className="hover:text-black dark:hover:text-white transition-colors">OCR PDF</Link>
              <Link href="/edit-pdf" className="hover:text-black dark:hover:text-white transition-colors font-medium text-black dark:text-white">Edit PDF</Link>
              <Link href="/add-page-numbers" className="hover:text-black dark:hover:text-white transition-colors">Page Numbers</Link>
              <Link href="/watermark-pdf" className="hover:text-black dark:hover:text-white transition-colors">Add Watermark</Link>
              <Link href="/crop-pdf" className="hover:text-black dark:hover:text-white transition-colors">Crop PDF</Link>
              <Link href="/pdf-forms" className="hover:text-black dark:hover:text-white transition-colors">PDF Forms</Link>
            </div>
          </div>

          {/* Category 3: Convert PDF */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-3">
              Convert PDF
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              <Link href="/jpg-to-pdf" className="hover:text-black dark:hover:text-white transition-colors">JPG to PDF</Link>
              <Link href="/word-to-pdf" className="hover:text-black dark:hover:text-white transition-colors">Word to PDF</Link>
              <Link href="/powerpoint-to-pdf" className="hover:text-black dark:hover:text-white transition-colors">PowerPoint to PDF</Link>
              <Link href="/excel-to-pdf" className="hover:text-black dark:hover:text-white transition-colors">Excel to PDF</Link>
              <Link href="/pdf-to-jpg" className="hover:text-black dark:hover:text-white transition-colors">PDF to JPG</Link>
              <Link href="/pdf-to-word" className="hover:text-black dark:hover:text-white transition-colors">PDF to Word</Link>
              <Link href="/pdf-to-powerpoint" className="hover:text-black dark:hover:text-white transition-colors">PDF to PowerPoint</Link>
              <Link href="/pdf-to-excel" className="hover:text-black dark:hover:text-white transition-colors">PDF to Excel</Link>
              <Link href="/pdf-to-pdfa" className="hover:text-black dark:hover:text-white transition-colors">PDF to PDF/A</Link>
            </div>
          </div>

          {/* Category 4: Security & Intelligence */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-3">
              Security & AI
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              <Link href="/protect-pdf" className="hover:text-black dark:hover:text-white transition-colors">Protect PDF</Link>
              <Link href="/unlock-pdf" className="hover:text-black dark:hover:text-white transition-colors">Unlock PDF</Link>
              <Link href="/sign-pdf" className="hover:text-black dark:hover:text-white transition-colors">Sign PDF</Link>
              <Link href="/redact-pdf" className="hover:text-black dark:hover:text-white transition-colors">Redact PDF</Link>
              <Link href="/compare-pdf" className="hover:text-black dark:hover:text-white transition-colors">Compare PDF</Link>
              <Link href="/ai-summarizer" className="hover:text-black dark:hover:text-white transition-colors">AI Summarizer</Link>
              <Link href="/translate-pdf" className="hover:text-black dark:hover:text-white transition-colors">Translate PDF</Link>
              <Link href="/pdf-to-markdown" className="hover:text-black dark:hover:text-white transition-colors">PDF to Markdown</Link>
              <Link href="/workflows" className="hover:text-black dark:hover:text-white transition-colors font-medium text-black dark:text-white">Workflows</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Company Links */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-6 sm:flex-row text-xs text-[#52504e] dark:text-[#d6d3d1]">
          <p>© {new Date().getFullYear()} EditMyPDF. 100% Free, Private, Browser-Based Document Workspace.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">About</Link>
            <span>·</span>
            <Link href="/how-it-works" className="hover:text-black dark:hover:text-white transition-colors">How It Works</Link>
            <span>·</span>
            <Link href="/security" className="hover:text-black dark:hover:text-black transition-colors">Security</Link>
            <span>·</span>
            <Link href="/privacy-policy" className="hover:text-black dark:hover:text-white transition-colors font-semibold text-black dark:text-white">Privacy Policy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">Terms</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-black dark:hover:text-white transition-colors">Contact</Link>
            <span>·</span>
            <Link href="/sitemap.xml" className="hover:text-black dark:hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
