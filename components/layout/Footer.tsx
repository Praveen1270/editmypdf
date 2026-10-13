import Link from "next/link";
import { Shield } from "lucide-react";
import { PDF_TOOLS } from "@/lib/tools-data";

export function Footer() {
  const organizeAndLayoutTools = PDF_TOOLS.filter(
    (t) => t.category === "organize" || t.category === "layout"
  );
  const convertAndInspectTools = PDF_TOOLS.filter(
    (t) => t.category === "convert" || t.category === "security"
  );

  return (
    <footer className="border-t border-border bg-surface-muted py-14 text-sm text-text-secondary">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Privacy Statement */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-text-primary">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden bg-black text-white shadow-sm">
                <img
                  src="/logo.png?v=2"
                  alt="PDFKit Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-extrabold tracking-tight">PDF<span className="font-semibold text-text-secondary">Kit</span></span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-text-secondary">
              20 private PDF utilities operating entirely inside your browser. No files, passwords, or data ever leave your device.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-text-primary font-semibold">
              <Shield className="h-3.5 w-3.5 text-text-primary" />
              <span>100% Client-Side Processing</span>
            </div>
            <p className="mt-2 text-[11px] text-text-tertiary">
              Self-hosted WebAssembly & Web Crypto. Zero tracking cookies.
            </p>
          </div>

          {/* Column 1: Organize & Layout Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Organize & Layout
            </h4>
            <div className="mt-3 flex flex-col gap-1.5 text-xs">
              {organizeAndLayoutTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="transition-colors hover:text-text-primary"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Convert & Inspect Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Convert & Inspect
            </h4>
            <div className="mt-3 flex flex-col gap-1.5 text-xs">
              {convertAndInspectTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="transition-colors hover:text-text-primary"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Trust & Security */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Knowledge & Trust
            </h4>
            <div className="mt-3 flex flex-col gap-1.5 text-xs">
              <Link href="/about" className="transition-colors hover:text-text-primary">
                About PDFKit
              </Link>
              <Link href="/how-it-works" className="transition-colors hover:text-text-primary">
                How It Works & Verification
              </Link>
              <Link href="/security" className="transition-colors hover:text-text-primary">
                Security & Cryptography
              </Link>
              <Link href="/faq" className="transition-colors hover:text-text-primary">
                Frequently Asked Questions
              </Link>
              <Link href="/accessibility" className="transition-colors hover:text-text-primary">
                Accessibility Statement
              </Link>
            </div>
          </div>

          {/* Column 4: Legal & Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Legal & Support
            </h4>
            <div className="mt-3 flex flex-col gap-1.5 text-xs">
              <Link href="/privacy-policy" className="transition-colors hover:text-text-primary font-medium text-text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-text-primary">
                Terms of Service
              </Link>
              <Link href="/disclaimer" className="transition-colors hover:text-text-primary">
                Output Disclaimer
              </Link>
              <Link href="/cookie-policy" className="transition-colors hover:text-text-primary">
                Cookie & Storage Policy
              </Link>
              <Link href="/contact" className="transition-colors hover:text-text-primary">
                Contact & Feedback
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row text-xs text-text-tertiary">
          <p>© {new Date().getFullYear()} PDFKit. Open standards, local memory, zero server uploads.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-text-primary">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-text-primary">Terms</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-text-primary">Contact</Link>
            <span>·</span>
            <Link href="/sitemap.xml" className="hover:text-text-primary">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
