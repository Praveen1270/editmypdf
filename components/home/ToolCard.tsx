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
  PenLine,
  Trash2,
  Presentation,
  FileCode,
  FormInput,
  Languages,
  Archive,
  Workflow,
  Code2,
  Table,
  BookOpen,
  Receipt,
  ShoppingCart,
  PenTool,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  Wrench,
  ScanLine,
  Moon,
  Layers,
  Eraser,
  Fingerprint,
  Code,
  Book,
  FileType,
  Wand2,
} from "lucide-react";
import { ToolItem } from "@/lib/tools-data";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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
  PenLine,
  Trash2,
  Presentation,
  FileCode,
  FormInput,
  Languages,
  Archive,
  Workflow,
  Code2,
  Table,
  BookOpen,
  Receipt,
  ShoppingCart,
  PenTool,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  Wrench,
  ScanLine,
  Moon,
  Layers,
  Eraser,
  Fingerprint,
  Code,
  Book,
  FileType,
  Wand2,
};

// Distinct theme tints based on tool categories for visual hierarchy
function getToolTint(toolId: string) {
  if (toolId.includes("protect") || toolId.includes("lock") || toolId.includes("redact") || toolId.includes("sign")) {
    return {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      border: "border-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      hover: "group-hover:bg-emerald-600 group-hover:text-white",
    };
  }
  if (toolId.includes("compress") || toolId.includes("repair") || toolId.includes("ocr")) {
    return {
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      border: "border-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
      hover: "group-hover:bg-amber-600 group-hover:text-white",
    };
  }
  if (toolId.includes("ai-") || toolId.includes("chat") || toolId.includes("translate")) {
    return {
      bg: "bg-purple-500/10 dark:bg-purple-500/15",
      border: "border-purple-500/20",
      text: "text-purple-600 dark:text-purple-400",
      hover: "group-hover:bg-purple-600 group-hover:text-white",
    };
  }
  if (toolId.includes("merge") || toolId.includes("split") || toolId.includes("organize") || toolId.includes("rotate")) {
    return {
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
      border: "border-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      hover: "group-hover:bg-blue-600 group-hover:text-white",
    };
  }
  return {
    bg: "bg-accent/10 dark:bg-accent/15",
    border: "border-accent/20",
    text: "text-accent",
    hover: "group-hover:bg-accent group-hover:text-white",
  };
}

interface ToolCardProps {
  tool: ToolItem;
  featured?: boolean;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = ICON_MAP[tool.iconName] || Wrench;
  const tint = getToolTint(tool.id);

  return (
    <Link
      href={tool.href}
      className="group relative flex flex-col justify-between h-full min-h-[160px] p-4 sm:p-5 rounded-2xl border border-border bg-surface shadow-paper hover:shadow-paper-elevated hover:border-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
    >
      <div>
        {/* Tool Icon Box */}
        <div className="flex items-center justify-between mb-3.5">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${tint.bg} ${tint.border} ${tint.text} ${tint.hover} transition-all duration-200 shrink-0`}
          >
            <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-foreground transition-all duration-200" />
        </div>

        {/* Tool Title */}
        <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-accent transition-colors leading-snug">
          {tool.name}
        </h3>

        {/* Short Benefit Description */}
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {tool.shortDesc}
        </p>
      </div>

      {/* Card Footer indicator */}
      <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="truncate">{tool.categoryName}</span>
        <span className="font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
          Open →
        </span>
      </div>
    </Link>
  );
}
