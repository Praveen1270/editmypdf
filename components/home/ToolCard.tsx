"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, ToolItem } from "@/lib/tools-data";
import { getToolIcon } from "@/lib/icons";

interface ToolCardProps {
  tool: ToolItem;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = getToolIcon(tool.icon);
  const categoryName =
    CATEGORIES.find((c) => c.id === tool.categoryId)?.name ?? tool.categoryId;

  return (
    <Link
      href={tool.href}
      className="group relative flex flex-col justify-between h-full min-h-[170px] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md hover:border-black dark:hover:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white transition-all duration-150"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white group-hover:scale-105 transition-transform duration-150 shrink-0">
            <Icon className="h-5 w-5 text-black dark:text-white stroke-[2]" />
          </div>
          <ArrowRight className="h-4 w-4 text-black dark:text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150" />
        </div>

        <h3 className="font-bold text-sm sm:text-base text-black dark:text-white leading-snug">
          {tool.name}
        </h3>

        <p className="mt-2 text-xs text-[#52504e] dark:text-[#d6d3d1] leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-[#52504e] dark:text-[#d6d3d1]">
        <span className="truncate">{categoryName}</span>
        <span className="font-semibold text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">
          Open →
        </span>
      </div>
    </Link>
  );
}
