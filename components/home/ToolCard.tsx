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

interface ToolCardProps {
  tool: ToolItem;
  featured?: boolean;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = ICON_MAP[tool.iconName] || Wrench;

  return (
    <Link
      href={tool.href}
      className="group relative flex flex-col justify-between h-full min-h-[170px] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-black dark:hover:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white transition-all duration-150"
    >
      <div>
        {/* Tool Icon Box — Pure High-Contrast Monochrome */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white group-hover:scale-105 transition-transform duration-150 shrink-0">
            <Icon className="h-5 w-5 text-black dark:text-white stroke-[2]" />
          </div>
          <ArrowRight className="h-4 w-4 text-black dark:text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150" />
        </div>

        {/* Tool Title */}
        <h3 className="font-bold text-sm sm:text-base text-black dark:text-white leading-snug">
          {tool.name}
        </h3>

        {/* Short Benefit Description */}
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
          {tool.shortDesc}
        </p>
      </div>

      {/* Card Footer indicator */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="truncate">{tool.categoryName}</span>
        <span className="font-semibold text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">
          Open →
        </span>
      </div>
    </Link>
  );
}
