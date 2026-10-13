import { CheckCircle2, Download, RotateCcw, FileText } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface ResultCardProps {
  filename: string;
  filesize?: number;
  reductionPercentage?: number;
  notes?: string;
  onDownload: () => void;
  onReset: () => void;
}

export function ResultCard({
  filename,
  filesize,
  reductionPercentage,
  notes,
  onDownload,
  onReset,
}: ResultCardProps) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-6 sm:p-8 text-center animate-in fade-in-50 duration-300">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-xl font-bold tracking-tight text-foreground">
        Processing Complete!
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Your file has been generated entirely inside your browser.
      </p>

      <div className="mx-auto mt-6 flex max-w-md items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-left shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <div className="overflow-hidden">
            <p className="truncate text-sm font-semibold text-foreground">
              {filename}
            </p>
            {filesize !== undefined && (
              <p className="text-xs text-muted-foreground">
                <span>{formatFileSize(filesize)}</span>
                {reductionPercentage !== undefined && (
                  reductionPercentage > 0 ? (
                    <span className="ml-1.5 font-medium text-success">
                      ({reductionPercentage}% smaller)
                    </span>
                  ) : reductionPercentage === 0 ? (
                    <span className="ml-1.5 font-medium text-muted-foreground">
                      (Already optimized)
                    </span>
                  ) : null
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {notes && (
        <p className="mx-auto mt-3 max-w-md text-xs text-muted-foreground">
          {notes}
        </p>
      )}

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          onClick={onDownload}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <Download className="h-4 w-4" />
          <span>Download File</span>
        </button>

        <button
          onClick={onReset}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-border"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Start Again</span>
        </button>
      </div>
    </div>
  );
}
