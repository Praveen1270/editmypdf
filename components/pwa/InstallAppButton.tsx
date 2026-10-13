"use client";

import React, { useEffect, useState } from "react";
import { Download, Check, Share, PlusSquare, X, Monitor, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallAppButton({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Check iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowModal(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Native PWA install prompt available (Chrome, Edge, Samsung Internet, Android)
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalled(true);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn("Error triggering installation prompt:", err);
      }
    } else {
      // Show instructional modal (iOS Safari, Firefox, or unsupported browsers)
      setShowModal(true);
    }
  };

  // If already running inside installed standalone app, show subtle monochrome status
  if (isStandalone || installed) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-xs font-medium text-text-secondary ${className}`}>
        <Check className="h-3.5 w-3.5 text-text-primary" />
        <span>Installed</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        aria-label="Install PDFKit Application"
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs font-semibold text-text-primary transition hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${className}`}
      >
        <Download className="h-3.5 w-3.5" />
        <span>{compact ? "Install" : "Install App"}</span>
      </button>

      {/* Instructional Modal for iOS or manual install */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-border bg-surface-base p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-raised hover:text-text-primary"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Install PDFKit
                </h3>
                <p className="text-xs text-text-secondary">
                  Use offline anytime directly from your home screen or dock
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              {isIOS ? (
                // iOS Safari Instructions
                <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-text-primary">
                    <Smartphone className="h-4 w-4" />
                    <span>How to install on iPhone & iPad:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-text-secondary leading-relaxed">
                    <li>
                      Tap the <strong className="text-text-primary">Share</strong> icon (<Share className="inline h-3 w-3 mx-0.5 text-text-primary" />) at the bottom or top of Safari.
                    </li>
                    <li>
                      Scroll down and select <strong className="text-text-primary">Add to Home Screen</strong> (<PlusSquare className="inline h-3 w-3 mx-0.5 text-text-primary" />).
                    </li>
                    <li>
                      Tap <strong className="text-text-primary">Add</strong> in the top-right corner to finish.
                    </li>
                  </ol>
                </div>
              ) : (
                // Desktop or Android instructions
                <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-text-primary">
                    <Monitor className="h-4 w-4" />
                    <span>Browser Installation:</span>
                  </div>
                  <p className="text-text-secondary leading-relaxed">
                    To install PDFKit as a standalone desktop app:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-text-secondary leading-relaxed">
                    <li>
                      In <strong className="text-text-primary">Google Chrome</strong> or <strong className="text-text-primary">Brave</strong>: click the install icon in the right side of the address bar.
                    </li>
                    <li>
                      In <strong className="text-text-primary">Microsoft Edge</strong>: click the App Available icon or go to <em>Settings → Apps → Install PDFKit</em>.
                    </li>
                    <li>
                      In <strong className="text-text-primary">Safari on macOS Sonoma+</strong>: choose <em>File → Add to Dock</em>.
                    </li>
                  </ul>
                </div>
              )}

              <div className="rounded-xl border border-border bg-surface-raised p-3 text-[11px] text-text-secondary leading-relaxed">
                <span className="font-semibold text-text-primary">✓ 100% Privacy Guaranteed:</span> All PDF processing continues to run locally on your device with or without internet connectivity.
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-action-primary px-4 py-2 text-xs font-semibold text-action-primary-text transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
