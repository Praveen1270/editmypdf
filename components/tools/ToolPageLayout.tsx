"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle2, AlertTriangle, Shield, HelpCircle } from "lucide-react";
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
    <div className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6">
        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-text-tertiary">
          <Link href="/" className="hover:text-text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {toolMeta && (
            <>
              <Link href={`/#${toolMeta.category}`} className="hover:text-text-primary transition-colors">
                {toolMeta.categoryName}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
          <span className="font-medium text-text-primary">{toolName}</span>
        </nav>

        {/* 2 & 3. Title & Description */}
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            {toolName}
          </h1>
          <p className="text-sm text-text-secondary sm:text-base max-w-2xl leading-relaxed">
            {description}
          </p>

          {/* 4. Privacy badge */}
          <div className="mt-2">
            <PrivacyBadge />
          </div>
        </div>

        {/* 5. Interactive Tool Workspace */}
        <div className="mt-8 rounded-2xl border border-border bg-surface-base p-4 shadow-sm sm:p-8">
          {children}
        </div>

        {/* 6. Helpful Content & SEO Sections */}
        {toolMeta && (
          <div className="mt-16 space-y-12 border-t border-border pt-12">
            {/* Step-by-Step Instructions */}
            {toolMeta.steps && toolMeta.steps.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  How to Use {toolName}
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {toolMeta.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-surface-raised p-5"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-action-primary text-action-primary-text text-xs font-bold">
                        {idx + 1}
                      </div>
                      <h3 className="mt-3 font-semibold text-text-primary text-sm">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-xs text-text-secondary leading-relaxed">
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
                <div className="rounded-xl border border-border p-6 bg-surface-base">
                  <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-text-primary" />
                    <span>Capabilities & Features</span>
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-xs text-text-secondary">
                    {toolMeta.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-text-primary font-bold mt-0.5">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Limitations */}
              {toolMeta.limitations && toolMeta.limitations.length > 0 && (
                <div className="rounded-xl border border-border p-6 bg-surface-base">
                  <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-text-primary" />
                    <span>Important Notes & Limitations</span>
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-xs text-text-secondary">
                    {toolMeta.limitations.map((lim, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-text-tertiary font-bold mt-0.5">•</span>
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Privacy Section for this tool */}
            <div className="rounded-xl border border-border bg-surface-raised p-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-text-primary" />
                <h3 className="text-base font-semibold text-text-primary">
                  Client-Side Privacy Guarantee
                </h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                When using {toolName}, your files, extracted text, and document metadata are processed exclusively inside your browser using client-side JavaScript, WebAssembly, and native Web Crypto APIs. Your document data is never sent to our servers or any cloud service. Once you close this tab or click clear, volatile memory is automatically released.
              </p>
            </div>

            {/* FAQs */}
            {toolMeta.faq && toolMeta.faq.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-text-primary" />
                  <span>Frequently Asked Questions</span>
                </h2>
                <div className="mt-4 space-y-3">
                  {toolMeta.faq.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-surface-base p-5 shadow-sm"
                    >
                      <h4 className="font-semibold text-text-primary text-sm">
                        {item.q}
                      </h4>
                      <p className="mt-2 text-xs text-text-secondary leading-relaxed">
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
        <div className="mt-16">
          <RelatedTools currentToolId={toolId} />
        </div>
      </div>
    </div>
  );
}
