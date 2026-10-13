import Link from "next/link";
import { FileQuestion, ArrowRight, Home, Search } from "lucide-react";
import { PDF_TOOLS } from "@/lib/tools-data";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4 py-16">
      <div className="max-w-xl text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-foreground">
          <FileQuestion className="h-7 w-7 text-primary" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Error 404 · Page Not Found
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            This page does not exist.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            The link you followed may be broken or the page may have been moved. You can return home or jump straight to any of our 20 client-side PDF tools.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-foreground/90 transition w-full sm:w-auto"
          >
            <Home className="h-4 w-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            href="/#tools"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition w-full sm:w-auto"
          >
            <Search className="h-4 w-4" />
            <span>Browse All 20 Tools</span>
          </Link>
        </div>

        {/* Quick popular tool shortcuts */}
        <div className="pt-8 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Popular PDF Utilities
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {PDF_TOOLS.slice(0, 6).map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-foreground hover:border-foreground/40 transition"
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
