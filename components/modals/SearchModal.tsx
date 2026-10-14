"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
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
import { PDF_TOOLS, ToolItem } from "@/lib/tools-data";
import { getStarredToolIds, toggleStarredToolId } from "@/lib/storage";

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

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function SearchModal({ isOpen, onClose, initialQuery = "" }: SearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setStarredIds(getStarredToolIds());
    const handleUpdate = () => setStarredIds(getStarredToolIds());
    window.addEventListener("editmypdf_starred_updated", handleUpdate);
    return () => window.removeEventListener("editmypdf_starred_updated", handleUpdate);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery]);

  const filteredTools = PDF_TOOLS.filter((tool) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.shortDesc.toLowerCase().includes(q) ||
      tool.categoryName.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleSelect = (tool: ToolItem) => {
    onClose();
    router.push(tool.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredTools.length ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && filteredTools[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredTools[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-16 sm:pt-24 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-border bg-surface shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden flex flex-col text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 bg-surface">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Find a PDF tool (e.g. merge, compress, protect)..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground p-1 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-surface-subtle px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredTools.length > 0 ? (
            <ul className="space-y-1">
              {filteredTools.map((tool, idx) => {
                const Icon = ICON_MAP[tool.iconName] || Files;
                const isSelected = idx === selectedIndex;
                return (
                  <li key={tool.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(tool)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                        isSelected
                          ? "bg-surface-subtle text-foreground"
                          : "text-muted-foreground hover:bg-surface-subtle/60 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border border-border shrink-0 ${
                            isSelected ? "bg-accent text-white border-accent" : "bg-surface-subtle text-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {tool.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {tool.shortDesc}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase hidden sm:inline">
                          {tool.category}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarredToolId(tool.id);
                          }}
                          aria-label={starredIds.includes(tool.id) ? "Unstar tool" : "Star tool"}
                          title={starredIds.includes(tool.id) ? "Unstar tool" : "Star tool"}
                          className="p-1 rounded hover:bg-surface text-foreground transition"
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${
                              starredIds.includes(tool.id) ? "fill-accent text-accent" : "text-muted-foreground"
                            }`}
                          />
                        </button>
                        <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? "translate-x-0.5 text-accent" : "text-muted-foreground"}`} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-10 text-center text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">No matching PDF tools found</p>
              <p className="mt-1">Try another keyword like &ldquo;compress&rdquo;, &ldquo;rotate&rdquo;, or &ldquo;protect&rdquo;</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-border bg-surface-subtle/50 px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{filteredTools.length} tools available</span>
          <div className="flex items-center gap-2">
            <span>Navigate <kbd className="font-mono">↑↓</kbd></span>
            <span>Select <kbd className="font-mono">↵</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
}
