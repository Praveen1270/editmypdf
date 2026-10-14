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
    const handleUpdate = () => setStarredIds(getStarredToolIds());
    window.addEventListener("editmypdf_starred_updated", handleUpdate);
    return () => window.removeEventListener("editmypdf_starred_updated", handleUpdate);
  }, []);

  const handleToggle = (e: React.MouseEvent, toolId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStarredToolId(toolId);
  };

  const starredTools = PDF_TOOLS.filter((t) => starredIds.includes(t.id));

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans transition-colors">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header */}
        <div className="border-b border-border pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Starred Tools
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Your pinned favorite PDF tools for rapid access. Stored locally in your browser.
          </p>
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
                  className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 min-h-[160px] transition hover:border-border-strong hover:bg-surface-subtle shadow-paper cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-subtle text-foreground transition-colors group-hover:bg-accent group-hover:text-white group-hover:border-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleToggle(e, tool.id)}
                      aria-label="Unstar tool"
                      className="p-1.5 text-accent hover:text-accent-hover transition rounded-lg"
                    >
                      <Star className="h-4 w-4 fill-accent" />
                    </button>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
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
          <div className="mt-12 text-center py-16 rounded-2xl border border-dashed border-border bg-surface p-8 shadow-paper">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-surface-subtle border border-border text-muted-foreground">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">
              No starred tools yet
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
              Click the star icon next to any PDF tool in the directory to bookmark it here for fast one-click access.
            </p>
            <div className="mt-6">
              <Link
                href="/#tools"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-paper hover:bg-accent-hover transition"
              >
                <span>Browse All 20 Tools</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
