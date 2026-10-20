"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Files, Scissors, Minimize2, Image, FileText, Wrench } from "lucide-react";
import { PDF_TOOLS } from "@/lib/tools-data";

interface RelatedToolsProps {
  currentToolId: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Files,
  Scissors,
  Minimize2,
  Image,
  FileText,
};

export function RelatedTools({ currentToolId }: RelatedToolsProps) {
  const related = PDF_TOOLS.filter((t) => t.id !== currentToolId).slice(0, 4);

  return (
    <section className="mt-14 border-t border-zinc-200 dark:border-zinc-800 pt-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-black dark:text-white">
            Explore More PDF Tools
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            All utilities run 100% locally in browser memory.
          </p>
        </div>
        <Link
          href="/#tools"
          className="inline-flex items-center gap-1 text-xs font-bold text-black dark:text-white hover:underline"
        >
          <span>View all tools</span>
          <ArrowRight className="h-3 w-3 stroke-[2.5]" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((tool) => {
          const Icon = ICON_MAP[tool.iconName] || Wrench;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="group flex flex-col justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition hover:border-black dark:hover:border-white shadow-xs"
            >
              <div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white transition-colors">
                  <Icon className="h-4 w-4 stroke-[2]" />
                </div>
                <h4 className="mt-3 text-sm font-bold text-black dark:text-white transition-colors">
                  {tool.name}
                </h4>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {tool.shortDesc}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-black dark:text-white">
                <span>Open tool</span>
                <ArrowRight className="h-3 w-3 stroke-[2] transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
