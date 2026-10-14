"use client";

import React, { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface GlobalToolSearchProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export function GlobalToolSearch({
  value,
  onChange,
  onClear,
  onSubmit,
  placeholder = "Find a PDF tool",
  className = "",
}: GlobalToolSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K keyboard shortcut focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-24 text-sm text-foreground placeholder:text-muted-foreground shadow-paper transition hover:border-border-strong focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="absolute right-3 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground transition"
              aria-label="Clear query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-surface-subtle px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            Ctrl K
          </kbd>
        </div>
      </div>
    </form>
  );
}
