"use client";

import { useState } from "react";
import {
  Binary,
  Loader2,
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
  HardDrive,
} from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { inspectPdfProperties, DocumentPropertiesReport } from "@/lib/pdf/properties";
import { downloadBytes } from "@/lib/files/download";

export default function PdfPageCounterPage() {
  const [report, setReport] = useState<DocumentPropertiesReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null);
    const f = files[0];
    setIsProcessing(true);

    try {
      const buffer = await f.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const res = await inspectPdfProperties(uint8, f.name);
      setReport(res);
    } catch (err: any) {
      setErrorMessage(`Failed to inspect PDF: ${err?.message || "File error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const [outputFilename, setOutputFilename] = useState<string>("document-report.txt");

  const handleDownloadReport = () => {
    if (!report) return;
    let clean = outputFilename.replace(/[\\/:*?"<>|\x00-\x1F]/g, "").trim();
    if (!clean) clean = "document-report.txt";
    if (!clean.toLowerCase().endsWith(".txt")) clean = `${clean}.txt`;
    const encoder = new TextEncoder();
    const bytes = encoder.encode(report.plainTextReport);
    downloadBytes(bytes, clean, "text/plain;charset=utf-8");
  };

  const handleReset = () => {
    setReport(null);
    setErrorMessage(null);
    setOutputFilename("document-report.txt");
  };

  return (
    <ToolPageLayout
      toolId="page-counter"
      toolName="PDF Page Counter & Properties"
      description="Inspect total page count, dimensions in points, millimeters, and inches, paper format, file size, and embedded metadata. Export a plain-text document audit report."
    >
      {!report ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF here"
          subtitle="or browse to inspect page counts, dimensions, and metadata"
          onFilesSelected={handleFileSelected}
        />
      ) : isProcessing ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm font-semibold text-foreground">Analyzing PDF Structure</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <Binary className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold text-foreground text-sm">{report.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {report.filesizeFormatted} ({report.filesize.toLocaleString()} bytes)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text shadow-sm hover:opacity-90"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Report (.txt)</span>
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Start Again
              </button>
            </div>
          </div>

          {/* Labeled File name field */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 max-w-md">
            <label htmlFor="report-filename" className="block text-xs font-semibold text-foreground mb-1">
              File name
            </label>
            <div className="flex gap-2">
              <input
                id="report-filename"
                type="text"
                value={outputFilename}
                onChange={(e) => setOutputFilename(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs font-medium text-foreground focus:border-border-strong focus:outline-none"
                placeholder="document-report.txt"
              />
              <button
                type="button"
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text shadow-sm hover:opacity-90 shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </button>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Exports comprehensive page dimension and metadata audit report as plain text (.txt).
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-surface-raised p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Layers className="h-4 w-4 text-text-primary" />
                <span>Total Pages</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{report.pageCount}</p>
            </div>

            <div className="rounded-xl border border-border bg-surface-raised p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <HardDrive className="h-4 w-4 text-text-primary" />
                <span>File Size</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{report.filesizeFormatted}</p>
            </div>

            <div className="rounded-xl border border-border bg-surface-raised p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <FileText className="h-4 w-4 text-text-primary" />
                <span>Primary Format</span>
              </div>
              <p className="mt-2 text-xl font-bold text-foreground">
                {report.pages[0]?.formatName || "Standard"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface-raised p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <CheckCircle2 className="h-4 w-4 text-text-primary" />
                <span>Security</span>
              </div>
              <p className="mt-2 text-xl font-bold text-foreground">Unrestricted</p>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="rounded-xl border border-border bg-surface-raised p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Embedded Metadata
            </h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Title:</span>{" "}
                <span className="font-medium text-foreground">{report.metadata.title || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Author:</span>{" "}
                <span className="font-medium text-foreground">{report.metadata.author || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Subject:</span>{" "}
                <span className="font-medium text-foreground">{report.metadata.subject || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Keywords:</span>{" "}
                <span className="font-medium text-foreground">{report.metadata.keywords || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Creator:</span>{" "}
                <span className="font-medium text-foreground">{report.metadata.creator || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Producer:</span>{" "}
                <span className="font-medium text-foreground">{report.metadata.producer || "—"}</span>
              </div>
            </div>
          </div>

          {/* Per-Page Dimensions Table */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Per-Page Specifications ({report.pages.length} Pages)
            </h3>
            <div className="max-h-72 overflow-y-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-surface-raised border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-2.5">Page</th>
                    <th className="p-2.5">Format</th>
                    <th className="p-2.5">Orientation</th>
                    <th className="p-2.5">Points (pt)</th>
                    <th className="p-2.5">Millimeters (mm)</th>
                    <th className="p-2.5">Inches (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface-base">
                  {report.pages.map((p) => (
                    <tr key={p.pageNumber} className="hover:bg-surface-raised">
                      <td className="p-2.5 font-medium text-foreground">#{p.pageNumber}</td>
                      <td className="p-2.5 text-foreground">{p.formatName}</td>
                      <td className="p-2.5 text-muted-foreground">{p.orientation}</td>
                      <td className="p-2.5 font-mono text-muted-foreground">
                        {p.widthPt} × {p.heightPt}
                      </td>
                      <td className="p-2.5 font-mono text-muted-foreground">
                        {p.widthMm} × {p.heightMm}
                      </td>
                      <td className="p-2.5 font-mono text-muted-foreground">
                        {p.widthIn} × {p.heightIn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
}
