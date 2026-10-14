import { Eye, CheckCircle2 } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Accessibility Statement — EditMyPDF",
  description: "Accessibility standards, WCAG 2.2 AA conformance, keyboard navigation, and reporting channels for EditMyPDF.",
  canonical: "/accessibility",
  keywords: ["pdf accessibility", "wcag pdf tools", "accessible pdf editor"],
});

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <div className="border-b border-border pb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs font-semibold text-text-primary">
            <Eye className="h-3.5 w-3.5 text-text-primary" />
            <span>Inclusive Design</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            Accessibility Statement
          </h1>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed">
            Our commitment to ensuring EditMyPDF utilities are accessible and intuitive for all users, regardless of device or ability.
          </p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto space-y-10 text-sm leading-relaxed text-text-primary">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              Conformance Standards (WCAG 2.2 AA)
            </h2>
            <p className="text-text-secondary">
              EditMyPDF conforms with the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA. We prioritize clean semantic markup, high-contrast monochrome typography, and intuitive keyboard navigation across all 20 PDF utilities.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-text-primary">
              Accessibility Features Implemented
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-1">
                <h3 className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-text-primary" />
                  <span>Full Keyboard Navigation</span>
                </h3>
                <p className="text-xs text-text-secondary">
                  All interactive controls, file drop zones, setting inputs, and download buttons can be focused and activated via <kbd className="rounded border border-border bg-surface-base px-1 text-[10px] text-text-primary">Tab</kbd>, <kbd className="rounded border border-border bg-surface-base px-1 text-[10px] text-text-primary">Enter</kbd>, and <kbd className="rounded border border-border bg-surface-base px-1 text-[10px] text-text-primary">Space</kbd>.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-1">
                <h3 className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-text-primary" />
                  <span>Strict Contrast Ratios</span>
                </h3>
                <p className="text-xs text-text-secondary">
                  Typography utilizes high-contrast neutral scales exceeding WCAG 4.5:1 minimum contrast standards in both light mode and dark mode.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-1">
                <h3 className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-text-primary" />
                  <span>Screen Reader Semantic ARIA</span>
                </h3>
                <p className="text-xs text-text-secondary">
                  File upload drop areas provide accessible labels, file constraints, and progress updates with proper ARIA live regions for screen reader feedback.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-1">
                <h3 className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-text-primary" />
                  <span>Reduced Motion Support</span>
                </h3>
                <p className="text-xs text-text-secondary">
                  We respect system <code>prefers-reduced-motion</code> preferences, eliminating unnecessary animations and keeping transitions instant at 150ms.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-surface-base p-6 shadow-sm">
            <h2 className="text-base font-bold text-text-primary">
              Reporting Accessibility Barriers
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              We continually audit our user interfaces. If you encounter an accessibility hurdle, keyboard trap, or unreadable element while using any of our tools, you can report it directly on our project repository:
            </p>
            <p className="text-xs text-text-primary font-medium">
              Submit an issue at:{" "}
              <a
                href="https://github.com/Praveen1270/editmypdf/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary hover:underline font-semibold"
              >
                GitHub Issues Tracker
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
