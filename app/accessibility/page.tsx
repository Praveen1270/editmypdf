import { Eye, CheckCircle2, MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Accessibility Statement — PDFKit",
  description: "Accessibility standards, keyboard navigation, and reporting channels for PDFKit.",
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <div className="border-b border-border pb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span>Inclusive Design</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Accessibility Statement
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Our commitment to ensuring PDFKit utilities are accessible and intuitive for all users, regardless of device or ability.
          </p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto space-y-10 text-sm leading-relaxed text-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              Conformance Standards (WCAG 2.1 AA)
            </h2>
            <p className="text-muted-foreground">
              PDFKit aims to conform with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. We prioritize clean semantic markup, high-contrast typography, and intuitive keyboard navigation across all 20 PDF utilities.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">
              Accessibility Features Implemented
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                <h3 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Full Keyboard Navigation</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  All interactive controls, file drop zones, setting inputs, and download buttons can be focused and activated via <kbd className="rounded border bg-white px-1 text-[10px]">Tab</kbd>, <kbd className="rounded border bg-white px-1 text-[10px]">Enter</kbd>, and <kbd className="rounded border bg-white px-1 text-[10px]">Space</kbd>.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                <h3 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Strict Contrast Ratios</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Typography uses deep charcoal and near-black (<code>#111111</code>) against crisp white backgrounds to surpass WCAG 4.5:1 minimum contrast standards.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                <h3 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Screen Reader Semantic ARIA</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  File upload drop areas provide accessible labels, file constraints, and progress updates with proper ARIA live regions for screen reader feedback.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                <h3 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Reduced Motion Support</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  We respect system <code>prefers-reduced-motion</code> preferences, eliminating unnecessary animations and distracting transitions.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground">
              Reporting Accessibility Barriers
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We continually audit our user interfaces. If you encounter an accessibility hurdle, keyboard trap, or unreadable element while using any of our tools, please let us know so we can fix it:
            </p>
            <p className="text-xs text-foreground font-medium">
              Email our accessibility team directly at:{" "}
              <a
                href="mailto:accessibility@pdfkit.local"
                className="text-primary hover:underline font-semibold"
              >
                accessibility@pdfkit.local
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
