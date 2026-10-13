import Link from "next/link";
import { FileText, Shield } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-content items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-white">
            <FileText className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight">PDFKit</span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-muted-foreground">
          <Link href="/#tools" className="transition-colors hover:text-foreground">
            Tools
          </Link>
          <Link href="/how-it-works" className="hidden md:inline transition-colors hover:text-foreground">
            How It Works
          </Link>
          <Link href="/faq" className="hidden sm:inline transition-colors hover:text-foreground">
            FAQ
          </Link>
          <Link href="/privacy-policy" className="flex items-center gap-1 transition-colors hover:text-foreground">
            <Shield className="h-3.5 w-3.5 text-success" />
            <span>Privacy</span>
          </Link>
          <Link href="/contact" className="hidden sm:inline transition-colors hover:text-foreground">
            Contact
          </Link>
          <Link href="/about" className="transition-colors hover:text-foreground">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
