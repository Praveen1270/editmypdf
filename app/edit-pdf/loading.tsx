import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 text-center sm:px-6" aria-label="Loading editor">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-foreground" />
      <p className="mt-3 text-sm font-semibold text-foreground">Loading the PDF editor…</p>
      <div className="mx-auto mt-6 grid max-w-4xl grid-cols-1 gap-4 lg:grid-cols-[210px_minmax(0,1fr)_260px]">
        <div className="hidden h-64 animate-pulse rounded-2xl bg-surface-subtle lg:block" />
        <div className="h-96 animate-pulse rounded-2xl bg-surface-subtle" />
        <div className="hidden h-64 animate-pulse rounded-2xl bg-surface-subtle lg:block" />
      </div>
    </div>
  );
}
