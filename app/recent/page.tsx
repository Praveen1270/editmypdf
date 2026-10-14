"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Trash2,
  FileText,
  ArrowRight,
  ShieldCheck,
  X,
  UploadCloud,
  Files,
  Minimize2,
  Scissors,
  Lock,
} from "lucide-react";
import {
  getRecentFiles,
  addRecentFile,
  removeRecentFile,
  clearRecentFiles,
  RecentFileRecord,
} from "@/lib/storage";
import { PDF_TOOLS } from "@/lib/tools-data";

export default function RecentFilesPage() {
  const [recentFiles, setRecentFiles] = useState<RecentFileRecord[]>([]);

  useEffect(() => {
    setRecentFiles(getRecentFiles());
    const handleUpdate = () => {
      setRecentFiles(getRecentFiles());
    };
    window.addEventListener("editmypdf_recent_updated", handleUpdate);
    return () => window.removeEventListener("editmypdf_recent_updated", handleUpdate);
  }, []);

  const handleClear = () => {
    if (confirm("Are you sure you want to clear your local recent files history?")) {
      clearRecentFiles();
      setRecentFiles([]);
    }
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeRecentFile(id);
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      addRecentFile({
        name: file.name,
        size: file.size,
        toolId: "merge",
        toolName: "EditMyPDF",
      });
    }
    e.target.value = "";
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes <= 0) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatTime = (ts: number) => {
    try {
      const diff = Math.floor((Date.now() - ts) / 1000);
      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return new Date(ts).toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans transition-colors">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Recent Documents
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Documents handled in your browser session. Data stays strictly in local browser storage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-subtle transition shadow-paper">
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Add Document</span>
              <input
                type="file"
                accept=".pdf,image/*"
                multiple
                className="hidden"
                onChange={handleManualUpload}
              />
            </label>

            {recentFiles.length > 0 && (
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-surface-subtle hover:text-foreground transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {recentFiles.length > 0 ? (
          <div className="mt-8 space-y-3">
            {recentFiles.map((item) => {
              const tool = PDF_TOOLS.find((t) => t.id === item.toolId);
              const toolHref = tool?.href || "/merge-pdf";
              const sizeStr = formatBytes(item.size);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition hover:border-border-strong hover:bg-surface-subtle shadow-paper"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-subtle text-foreground">
                      <FileText className="h-5 w-5 text-accent" />
                    </div>
                    <div className="min-w-0 truncate">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {sizeStr ? `${sizeStr} · ` : ""}
                        {item.toolName} · {formatTime(item.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Link
                      href={toolHref}
                      className="inline-flex items-center gap-1 rounded-lg bg-surface-subtle border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent hover:text-white hover:border-accent transition"
                    >
                      <span>Open tool</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={(e) => handleRemove(e, item.id)}
                      title="Remove from history"
                      aria-label={`Remove ${item.name}`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="mt-12 text-center py-16 rounded-2xl border border-dashed border-border bg-surface p-8 shadow-paper">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-surface-subtle border border-border text-muted-foreground">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">
              No recent documents yet
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
              When you edit, merge, compress, or convert PDF documents, your history will appear here for immediate access.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-paper hover:bg-accent-hover transition"
              >
                <span>Go to Document Workspace</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/merge-pdf"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle transition"
              >
                <Files className="h-3 w-3" />
                <span>Merge PDF</span>
              </Link>
              <Link
                href="/compress-pdf"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle transition"
              >
                <Minimize2 className="h-3 w-3" />
                <span>Compress PDF</span>
              </Link>
              <Link
                href="/split-pdf"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle transition"
              >
                <Scissors className="h-3 w-3" />
                <span>Split PDF</span>
              </Link>
              <Link
                href="/protect-pdf"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle transition"
              >
                <Lock className="h-3 w-3" />
                <span>Protect PDF</span>
              </Link>
            </div>
          </div>
        )}

        {/* Privacy notice */}
        <div className="mt-12 flex items-center gap-2.5 rounded-xl border border-border bg-surface-subtle/50 p-4 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
          <span>
            History exists only in your local browser storage. File contents are processed in volatile memory and never transmitted to any external server.
          </span>
        </div>
      </div>
    </div>
  );
}
