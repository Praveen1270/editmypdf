"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MainHeader } from "./MainHeader";
import { Footer } from "./Footer";
import { SearchModal } from "@/components/modals/SearchModal";
import { X } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  // Install app handler (PWA)
  const handleInstallApp = () => {
    const installBtn = document.getElementById("editmypdf-hidden-install-btn");
    if (installBtn) {
      installBtn.click();
    } else {
      alert("EditMyPDF runs offline directly in your browser. In Chrome/Edge, click the install icon in the URL address bar.");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* 1. Left Sidebar for Desktop (approx 330px fixed width, independent scroll) */}
      <div className="hidden lg:block w-[330px] shrink-0 h-full">
        <Sidebar
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenInstall={handleInstallApp}
        />
      </div>

      {/* Mobile / Tablet Slide-out Drawer */}
      {mobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative z-50 flex h-full w-[300px] sm:w-[330px] flex-col bg-surface-base shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Close button in drawer */}
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-text-secondary hover:bg-surface-raised hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-focus z-10"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>

            <Sidebar
              onOpenSearch={() => {
                setMobileDrawerOpen(false);
                setSearchModalOpen(true);
              }}
              onOpenInstall={() => {
                setMobileDrawerOpen(false);
                handleInstallApp();
              }}
              onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 2. Main Content Area (Flexible width, independent scroll) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Slim Header Bar */}
        <MainHeader
          onToggleMobileDrawer={() => setMobileDrawerOpen((prev) => !prev)}
          onOpenSearch={() => setSearchModalOpen(true)}
        />

        {/* Scrollable Dashboard / Page Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
          <Footer />
        </main>
      </div>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}
