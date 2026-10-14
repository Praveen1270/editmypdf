"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, Shield, HelpCircle } from "lucide-react";
import { RelatedTools } from "./RelatedTools";
import { PDF_TOOLS } from "@/lib/tools-data";

interface ToolPageLayoutProps {
  toolId: string;
  toolName: string;
  description: string;
  children: ReactNode;
}

export function ToolPageLayout({
  toolId,
  toolName,
  description,
  children,
}: ToolPageLayoutProps) {
  const toolMeta = PDF_TOOLS.find((t) => t.id === toolId);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors pb-20">
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
        {/* Workspace Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6 py-4 rounded-2xl shadow-paper mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/#tools"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition shrink-0"
              title="Back to all tools"
              aria-label="Back to all tools"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-foreground">
                  {toolName}
                </h1>
                <span className="rounded border border-border bg-surface-subtle px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  Client-side
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xl">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 self-end sm:self-center">
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-subtle px-2.5 py-1 text-foreground font-medium">
              <Shield className="h-3.5 w-3.5 text-accent" />
              <span>100% In-Browser RAM</span>
            </div>
          </div>
        </div>

        {/* Interactive Tool Workspace */}
        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-8 shadow-paper">
          {children}
        </div>

        {/* Helpful Content & Guidance Sections */}
        {toolMeta && (
          <div className="mt-14 space-y-10 border-t border-border pt-10">
            {/* Step-by-Step Instructions */}
            {toolMeta.steps && toolMeta.steps.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  How to Use {toolName}
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {toolMeta.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-surface p-5 shadow-paper"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-subtle border border-border text-foreground text-xs font-bold">
                        {idx + 1}
                      </div>
                      <h3 className="mt-3 font-semibold text-foreground text-sm">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features & Limitations Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Features */}
              {toolMeta.features && toolMeta.features.length > 0 && (
                <div className="rounded-xl border border-border p-6 bg-surface shadow-paper">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span>Capabilities & Features</span>
                  </h3>
                  <ul className="mt-3.5 space-y-2 text-xs text-muted-foreground">
                    {toolMeta.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-accent font-bold mt-0.5">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Limitations */}
              {toolMeta.limitations && toolMeta.limitations.length > 0 && (
                <div className="rounded-xl border border-border p-6 bg-surface shadow-paper">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span>Important Notes & Limitations</span>
                  </h3>
                  <ul className="mt-3.5 space-y-2 text-xs text-muted-foreground">
                    {toolMeta.limitations.map((lim, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-muted-foreground font-bold mt-0.5">•</span>
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* FAQs */}
            {toolMeta.faq && toolMeta.faq.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-accent" />
                  <span>Frequently Asked Questions</span>
                </h2>
                <div className="mt-4 space-y-3">
                  {toolMeta.faq.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-surface p-5 shadow-paper"
                    >
                      <h4 className="font-semibold text-foreground text-sm">
                        {item.q}
                      </h4>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Related PDF tools */}
        <div className="mt-14">
          <RelatedTools currentToolId={toolId} />
        </div>
      </div>
    </div>
  );
}
