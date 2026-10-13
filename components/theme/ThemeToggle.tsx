"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Guard against hydration mismatch
  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        aria-label="Toggle visual theme"
        className={`flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground opacity-60 ${className}`}
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`group relative flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2 text-foreground transition hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs font-medium text-foreground">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
