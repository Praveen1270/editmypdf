"use client";

import React, { useState, useEffect } from "react";
import { AppHeader } from "./AppHeader";
import { Footer } from "./Footer";
import { SearchModal } from "@/components/modals/SearchModal";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Global Ctrl+K / Cmd+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col font-sans transition-colors duration-150">
      {/* 1. Compact Top Navigation Header */}
      <AppHeader onOpenSearch={() => setSearchModalOpen(true)} />

      {/* 2. Main Editorial Page Workspace */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}
