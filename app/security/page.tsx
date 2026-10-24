import { ShieldCheck, Lock, KeyRound, ServerOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Security Architecture & Cryptography — EditMyPDF",
  description:
    "Technical documentation of EditMyPDF security practices, AES-256 Web Crypto standards, and local in-memory cryptography.",
  canonical: "/security",
  keywords: ["pdf security", "aes 256 pdf encryption", "client side pdf cryptography"],
});

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <div className="border-b border-border pb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs font-semibold text-text-primary">
            <Lock className="h-3.5 w-3.5 text-text-primary" />
            <span>Cryptographic Documentation</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            Security Architecture
          </h1>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed">
            Honest, factual documentation of our cryptographic implementations, dependency management, and privacy safeguards.
          </p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto space-y-10 text-sm leading-relaxed text-text-primary">
          {/* Section 1: In-Browser Cryptography */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-text-primary" />
              <span>1. Supported PDF Encryption Standards</span>
            </h2>
            <p className="text-text-secondary">
              EditMyPDF implements PDF document encryption using modern standard algorithms:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-secondary">
              <li>
                <strong>AES-256 (PDF 2.0 / ISO 32000-2):</strong> 256-bit Advanced Encryption Standard using Galois/Counter Mode or CBC with SHA-384 key derivation, verified for maximum security and compatibility with modern viewers.
              </li>
              <li>
                <strong>AES-128 (PDF 1.6):</strong> Standard 128-bit encryption for legacy workflow compatibility.
              </li>
              <li>
                <strong>Native Web Crypto API:</strong> Cipher primitives are executed directly via <code>window.crypto.subtle</code>, leveraging your CPU’s native hardware acceleration (AES-NI).
              </li>
            </ul>
          </section>

          {/* Section 2: Password Handling */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              2. Zero Transmission Password Life Cycle
            </h2>
            <p className="text-text-secondary">
              When you set or enter a password on the <strong>Protect PDF</strong> or <strong>Unlock PDF</strong> pages:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-secondary">
              <li>Passwords exist strictly as transient string variables in volatile JavaScript heap memory.</li>
              <li>Passwords are never logged to console, written to persistent storage, or transmitted across any network interface.</li>
              <li>Once encryption or decryption finishes, memory references are dereferenced for browser garbage collection.</li>
            </ul>
          </section>

          {/* Section 3: Dependency Governance */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              3. Dependency Auditing & Zero Remote CDNs
            </h2>
            <p className="text-text-secondary">
              To eliminate supply-chain threats and remote tracking vectors:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-secondary">
              <li>All production dependencies are pinned to specific versions in <code>package.json</code> and locked via <code>package-lock.json</code>.</li>
              <li>No dynamic external scripts, fonts, or CDN bundles are loaded at runtime.</li>
              <li>Mozilla’s <code>PDF.js</code> worker script (<code>pdf.worker.min.mjs</code>) is bundled locally on the application origin.</li>
            </ul>
          </section>

          {/* Section 4: Known Security Boundaries & Limitations */}
          <section className="rounded-xl border border-border bg-surface-raised p-5 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-text-primary" />
              <h3 className="font-semibold text-text-primary text-sm">
                4. Known Limitations & Security Boundaries
              </h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              We believe in complete honesty regarding technical limits:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-text-secondary">
              <li><strong>No Password Recovery:</strong> Because we possess no backdoor keys or cloud access, forgotten passwords cannot be recovered by our team.</li>
              <li><strong>Physical Device Security:</strong> If your local computer is infected with keyloggers or malware, browser memory could theoretically be inspected locally by malicious software on that machine.</li>
              <li><strong>No Independent Audit Claim:</strong> While built on audited open-source foundations (Web Crypto, Mozilla PDF.js), this specific web assembly has not undergone a formal third-party commercial penetration audit.</li>
            </ul>
          </section>

          <section className="border-t border-border pt-6">
            <p className="text-xs text-text-secondary">
              For complete details on data privacy, review our{" "}
              <Link href="/privacy-policy" className="text-text-primary hover:underline font-semibold">
                Privacy Policy
              </Link>{" "}
              or test local processing directly via our{" "}
              <Link href="/how-it-works" className="text-text-primary hover:underline font-semibold">
                Verification Guide
              </Link>.
            </p>
            <p className="mt-2 text-xs text-text-secondary">
              Security questions or vulnerability reports:{" "}
              <a href="mailto:founder@editmypdf.co.in" className="text-text-primary hover:underline font-semibold">
                founder@editmypdf.co.in
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
