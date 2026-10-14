"use client";

import React from "react";
import Link from "next/link";
import {
  Star,
  ArrowRight,
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
} from "lucide-react";
import { ToolItem } from "@/lib/tools-data";

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

const POPULAR_TOOL_IDS = new Set(["merge", "split", "compress", "protect", "watermark", "organize"]);

interface ToolListRowProps {
  tool: ToolItem;
  isStarred: boolean;
  onToggleStar: (e: React.MouseEvent, toolId: string) => void;
}

export function ToolListRow({ tool, isStarred, onToggleStar }: ToolListRowProps) {
  const Icon = ICON_MAP[tool.iconName] || Files;
  const isPopular = POPULAR_TOOL_IDS.has(tool.id);

  return (
    <Link
      href={tool.href}
      className="group flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3.5 transition-colors duration-150 hover:bg-surface-subtle last:border-b-0 cursor-pointer"
    >
      {/* Left: Icon, Tool Name, Description */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-subtle text-foreground transition-colors group-hover:border-accent/40 group-hover:bg-accent/10 group-hover:text-accent">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
              {tool.name}
            </span>
            {isPopular && (
              <span className="rounded border border-border bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground group-hover:border-accent/20">
                Popular
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate leading-relaxed">
            {tool.shortDesc}
          </span>
        </div>
      </div>

      {/* Right: Star Button & Arrow */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={(e) => onToggleStar(e, tool.id)}
          aria-label={isStarred ? `Unstar ${tool.name}` : `Star ${tool.name}`}
          title={isStarred ? "Unstar tool" : "Star tool"}
          className={`p-1 rounded-md transition-colors ${
            isStarred
              ? "text-accent"
              : "opacity-0 group-hover:opacity-60 hover:!opacity-100 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className={`h-4 w-4 ${isStarred ? "fill-accent text-accent" : ""}`} />
        </button>

        <div className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
