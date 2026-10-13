import Link from "next/link";
import { FileText, Shield, CheckCircle2 } from "lucide-react";
import { PDF_TOOLS } from "@/lib/tools-data";

export function Footer() {
  const organizeAndLayoutTools = PDF_TOOLS.filter(
    (t) => t.category === "organize" || t.category === "layout"
  );
  const convertAndInspectTools = PDF_TOOLS.filter(
    (t) => t.category === "convert" || t.category === "security"
  );

  return (
    <footer className="border-t border-border bg-muted/30 py-14 text-sm text-muted-foreground">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Privacy Statement */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white shadow-sm overflow-hidden">
                <svg
                  className="h-4 w-4 text-white"
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
                </svg>
              </div>
              <span className="font-extrabold tracking-tight">PDF<span className="text-primary">Kit</span></span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              20 private PDF utilities operating entirely inside your browser. No files, passwords, or data ever leave your device.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-foreground font-semibold">
              <Shield className="h-3.5 w-3.5 text-success" />
              <span>100% Client-Side Processing</span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Self-hosted WebAssembly & Web Crypto. Zero tracking cookies.
            </p>
          </div>

          {/* Column 1: Organize & Layout Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Organize & Layout
            </h4>
            <div className="mt-3 flex flex-col gap-1.5 text-xs">
              {organizeAndLayoutTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="transition-colors hover:text-foreground"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Convert & Inspect Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Convert & Inspect
            </h4>
            <div className="mt-3 flex flex-col gap-1.5 text-xs">
              {convertAndInspectTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="transition-colors hover:text-foreground"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Trust & Security */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Knowledge & Trust
            </h4>
            <div className="mt-3 flex flex-col gap-1.5 text-xs">
              <Link href="/how-it-works" className="transition-colors hover:text-foreground">
                How It Works & Verification
              </Link>
              <Link href="/security" className="transition-colors hover:text-foreground">
                Security & Cryptography
              </Link>
              <Link href="/faq" className="transition-colors hover:text-foreground">
                Frequently Asked Questions
              </Link>
              <Link href="/accessibility" className="transition-colors hover:text-foreground">
                Accessibility Statement
              </Link>
              <Link href="/about" className="transition-colors hover:text-foreground">
                About PDFKit
              </Link>
            </div>
          </div>

          {/* Column 4: Legal & Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Legal & Support
            </h4>
            <div className="mt-3 flex flex-col gap-1.5 text-xs">
              <Link href="/privacy-policy" className="transition-colors hover:text-foreground font-medium text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/disclaimer" className="transition-colors hover:text-foreground">
                Output Disclaimer
              </Link>
              <Link href="/cookie-policy" className="transition-colors hover:text-foreground">
                Cookie & Storage Policy
              </Link>
              <Link href="/contact" className="transition-colors hover:text-foreground">
                Contact & Feedback
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} PDFKit. Open standards, local memory, zero server uploads.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-foreground">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <span>·</span>
            <Link href="/sitemap.xml" className="hover:text-foreground">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
