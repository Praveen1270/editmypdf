import Link from "next/link";
import { WifiOff, ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Offline Mode — EditMyPDF",
  description: "EditMyPDF operates offline in your browser. All loaded PDF tools function without internet access.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface-raised text-text-primary">
        <WifiOff className="h-8 w-8" />
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        You are currently offline
      </h1>

      <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base leading-relaxed">
        Because EditMyPDF processes documents 100% inside your browser using client-side WebAssembly, tools you have already opened remain functional without an internet connection.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-full border border-border bg-surface-raised px-4 py-1.5 text-xs font-medium text-text-primary">
        <Shield className="h-3.5 w-3.5" />
        <span>Client-side local processing is always active</span>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-action-primary px-6 py-2.5 text-sm font-semibold text-action-primary-text shadow-sm transition hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
