"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle2, AlertTriangle, Shield, HelpCircle, ArrowRight } from "lucide-react";
import { PrivacyBadge } from "@/components/layout/PrivacyBadge";
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
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6">
        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {toolMeta && (
            <>
              <Link href={`/#${toolMeta.category}`} className="hover:text-foreground">
                {toolMeta.categoryName}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
          <span className="font-medium text-foreground">{toolName}</span>
        </nav>

        {/* 2 & 3. Title & Description */}
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {toolName}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base max-w-2xl leading-relaxed">
            {description}
          </p>

          {/* 4. Privacy note with lock icon */}
          <div className="mt-2">
            <PrivacyBadge />
          </div>
        </div>

        {/* 5-11. Interactive Tool Workspace */}
        <div className="mt-8 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-8">
          {children}
        </div>

        {/* Helpful Content & SEO Sections */}
        {toolMeta && (
          <div className="mt-16 space-y-12 border-t border-border pt-12">
            {/* Step-by-Step Instructions */}
            {toolMeta.steps && toolMeta.steps.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  How to Use {toolName}
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {toolMeta.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-muted/20 p-5"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-bold text-white">
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
                <div className="rounded-xl border border-border p-6 bg-white">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span>Capabilities & Features</span>
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
                    {toolMeta.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-foreground font-bold mt-0.5">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Limitations */}
              {toolMeta.limitations && toolMeta.limitations.length > 0 && (
                <div className="rounded-xl border border-border p-6 bg-white">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <span>Important Notes & Limitations</span>
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
                    {toolMeta.limitations.map((lim, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Privacy Section for this tool */}
            <div className="rounded-xl border border-border bg-muted/20 p-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                <h3 className="text-base font-semibold text-foreground">
                  Client-Side Privacy Guarantee
                </h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                When using {toolName}, your files, extracted text, and document metadata are processed exclusively inside your browser using client-side JavaScript, WebAssembly, and native Web Crypto APIs. Your document data is never sent to our servers or any cloud service. Once you close this tab or click clear, volatile memory is automatically released.
              </p>
            </div>

            {/* FAQs */}
            {toolMeta.faq && toolMeta.faq.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <span>Frequently Asked Questions</span>
                </h2>
                <div className="mt-4 space-y-3">
                  {toolMeta.faq.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-white p-5 shadow-sm"
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

        {/* 12. Related PDF tools */}
        <div className="mt-16">
          <RelatedTools currentToolId={toolId} />
        </div>
      </div>
    </div>
  );
}
