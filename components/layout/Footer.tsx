import Link from "next/link";
import { Shield } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TOOL_CATEGORIES, PDF_TOOLS } from "@/lib/tools-data";

export function Footer() {
  const organizeCat = TOOL_CATEGORIES.find((c) => c.id === "organize-pages");
  const editCat = TOOL_CATEGORIES.find((c) => c.id === "edit-pdf");
  const convertCat = TOOL_CATEGORIES.find((c) => c.id === "convert-files");

  const organizeTools = (organizeCat?.toolIds || [])
    .map((id) => PDF_TOOLS.find((t) => t.id === id))
    .filter(Boolean);

  const editTools = (editCat?.toolIds || [])
    .map((id) => PDF_TOOLS.find((t) => t.id === id))
    .filter(Boolean);

  const convertTools = (convertCat?.toolIds || [])
    .map((id) => PDF_TOOLS.find((t) => t.id === id))
    .filter(Boolean);

  return (
    <footer className="border-t border-border bg-surface-subtle/50 py-12 text-sm text-muted-foreground transition-colors">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Privacy Statement */}
          <div className="lg:col-span-2 pr-0 lg:pr-6">
            <BrandLogo markSize={24} />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground max-w-sm">
              EditMyPDF is a simple online PDF workspace for editing, organizing, converting, and managing PDF documents directly in your browser.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-foreground font-medium">
              <Shield className="h-4 w-4 text-accent" />
              <span>100% In-Browser Privacy Guarantee</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Files never leave your computer. Built with WebAssembly and Web Crypto.
            </p>
          </div>

          {/* Column 1: Organize & Edit */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Organize & Edit
            </h4>
            <div className="mt-3 flex flex-col gap-2 text-xs">
              {organizeTools.slice(0, 4).map((tool) => tool && (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="transition-colors hover:text-foreground"
                >
                  {tool.name}
                </Link>
              ))}
              {editTools.slice(0, 2).map((tool) => tool && (
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

          {/* Column 2: Convert & Optimize */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Convert & Security
            </h4>
            <div className="mt-3 flex flex-col gap-2 text-xs">
              {convertTools.map((tool) => tool && (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="transition-colors hover:text-foreground"
                >
                  {tool.name}
                </Link>
              ))}
              <Link href="/protect-pdf" className="transition-colors hover:text-foreground">
                Protect PDF
              </Link>
              <Link href="/unlock-pdf" className="transition-colors hover:text-foreground">
                Unlock PDF
              </Link>
            </div>
          </div>

          {/* Column 3: Trust & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              About & Trust
            </h4>
            <div className="mt-3 flex flex-col gap-2 text-xs">
              <Link href="/about" className="transition-colors hover:text-foreground">
                About EditMyPDF
              </Link>
              <Link href="/how-it-works" className="transition-colors hover:text-foreground">
                How It Works
              </Link>
              <Link href="/security" className="transition-colors hover:text-foreground">
                Security & AES-256
              </Link>
              <Link href="/privacy-policy" className="transition-colors hover:text-foreground font-medium text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-foreground">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} EditMyPDF. Simple, private, browser-based document workspace.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <span>·</span>
            <Link href="/sitemap.xml" className="hover:text-foreground transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
