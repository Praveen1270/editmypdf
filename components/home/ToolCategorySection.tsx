"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ToolDirectoryCategory, ToolItem } from "@/lib/tools-data";
import { ToolListRow } from "./ToolListRow";

interface ToolCategorySectionProps {
  category: ToolDirectoryCategory;
  tools: ToolItem[];
  defaultExpanded?: boolean;
}

export function ToolCategorySection({
  category,
  tools,
  defaultExpanded = true,
}: ToolCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (tools.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-surface overflow-hidden shadow-paper transition-shadow hover:shadow-paper-elevated">
      {/* Category Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between border-b border-border bg-surface-subtle/40 px-5 py-4 text-left transition hover:bg-surface-subtle"
        aria-expanded={isExpanded}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              {category.name}
            </h3>
            <span className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
              {tools.length}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {category.description}
          </p>
        </div>

        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-transform">
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-150 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Rows of Tools */}
      {isExpanded && (
        <div className="divide-y divide-border">
          {tools.map((tool) => (
            <ToolListRow
              key={tool.id}
              tool={tool}
            />
          ))}
        </div>
      )}
    </section>
  );
}
