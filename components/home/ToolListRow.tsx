"use client";

import React from "react";
import Link from "next/link";
import {
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
}

export function ToolListRow({ tool }: ToolListRowProps) {
  const Icon = ICON_MAP[tool.iconName] || Files;
  const isPopular = POPULAR_TOOL_IDS.has(tool.id);

  return (
    <Link
      href={tool.href}
      className="group flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3.5 transition-colors duration-150 hover:bg-surface-subtle last:border-b-0 cursor-pointer"
    >
      {/* Left: Icon, Tool Name, Description */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-subtle text-foreground transition-colors group-hover:border-foreground/40 group-hover:bg-foreground/5">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-foreground transition-colors">
              {tool.name}
            </span>
            {isPopular && (
              <span className="rounded border border-border bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                Popular
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate leading-relaxed">
            {tool.shortDesc}
          </span>
        </div>
      </div>

      {/* Right: Arrow */}
      <div className="flex items-center shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
