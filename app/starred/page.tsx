"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  Files,
  Scissors,
  LayoutGrid,
  RotateCw,
  FolderOutput,
  Minimize2,
  Image,
  FileImage,
  FileText,
  Palette,
  Hash,
  Stamp,
  Type,
  Crop,
  Maximize,
  Lock,
  Unlock,
  FileSliders,
  Binary,
  GitCompare,
  ArrowRight,
} from "lucide-react";
import { PDF_TOOLS, ToolItem } from "@/lib/tools-data";
import {
  getStarredToolIds,
  toggleStarredToolId,
} from "@/lib/storage";

const ICON_MAP: Record<string, any> = {
  Files,
  Scissors,
  LayoutGrid,
  RotateCw,
  FolderOutput,
  Minimize2,
  Image,
  FileImage,
  FileText,
  Palette,
  Hash,
  Stamp,
  Type,
  Crop,
  Maximize,
  Lock,
  Unlock,
  FileSliders,
  Binary,
  GitCompare,
};

export default function StarredPage() {
  const [starredIds, setStarredIds] = useState<string[]>([]);

  useEffect(() => {
    setStarredIds(getStarredToolIds());
    const handleUpdate = () => {
      setStarredIds(getStarredToolIds());
    };
    window.addEventListener("editmypdf_starred_updated", handleUpdate);
    return () => window.removeEventListener("editmypdf_starred_updated", handleUpdate);
  }, []);

  const handleToggleStar = (e: React.MouseEvent, toolId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStarredToolId(toolId);
  };

  const starredTools = PDF_TOOLS.filter((t) => starredIds.includes(t.id));

  return (
    <div className="min-h-full bg-background text-foreground pb-20 font-sans">
      <div className="mx-auto max-w-5xl px-4 sm:px-8 py-10 sm:py-14">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
               Starred Tools
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Quick access to your favorite PDF utilities. Star or unstar any tool at any time.
            </p>
          </div>

          <span className="text-xs font-mono font-semibold text-muted-foreground">
            {starredTools.length} {starredTools.length === 1 ? "Tool" : "Tools"}
          </span>
        </div>

        {/* Content */}
        {starredTools.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {starredTools.map((tool) => {
              const Icon = ICON_MAP[tool.iconName] || Files;

              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 min-h-[160px] sm:min-h-[170px] transition-all duration-150 hover:border-ring hover:bg-accent shadow-sm cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleStar(e, tool.id)}
                      aria-label="Remove from starred"
                      title="Remove from starred"
                      className="p-1 text-muted-foreground hover:text-foreground transition"
                    >
                      <Star className="h-4 w-4 fill-foreground text-foreground" />
                    </button>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-base font-bold text-card-foreground">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {tool.shortDesc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="mt-12 text-center py-16 rounded-2xl border border-dashed border-border bg-surface-raised/20">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-surface-raised border border-border text-text-tertiary">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-text-primary">
              No starred tools yet
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-text-secondary leading-relaxed">
              Click the star icon on any tool card or in the search results to pin your favorite utilities here.
            </p>

            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-4 py-2 text-xs font-semibold text-action-primary-text transition hover:opacity-90"
              >
                <span>Browse All Tools</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
