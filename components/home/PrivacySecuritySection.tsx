import React from "react";
import { ShieldCheck, HardDrive, Lock, EyeOff, Zap } from "lucide-react";

const HIGHLIGHTS = [
  {
    title: "Zero Server Uploads",
    desc: "Your files never leave your device. All parsing, rendering, and modifications happen inside your local browser instance.",
    icon: HardDrive,
  },
  {
    title: "Client-Side Cryptography",
    desc: "AES-256 standard encryption and password protection are executed via the native browser Web Crypto API.",
    icon: Lock,
  },
  {
    title: "Volatile Memory Execution",
    desc: "Documents exist only in temporary RAM while your tab is active. Closing or reloading the tab purges all data permanently.",
    icon: EyeOff,
  },
  {
    title: "Zero Latency Transfers",
    desc: "Without large file uploads or network waiting times, operations run at the full speed of your local device CPU.",
    icon: Zap,
  },
];

export function PrivacySecuritySection() {
  return (
    <section className="mt-20 pt-12 border-t border-border">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-surface to-surface-subtle/50 p-8 sm:p-12 shadow-paper">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
            <ShieldCheck className="h-4 w-4" />
            <span>Privacy By Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Your Documents Never Leave Your Device
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Traditional online PDF converters upload your confidential agreements, bank statements, and tax returns to cloud servers. EditMyPDF was engineered from the ground up to run entirely in client-side WebAssembly, ensuring total data privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HIGHLIGHTS.map((h) => {
            const Icon = h.icon;
            return (
              <div
                key={h.title}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent mb-3.5">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1.5">
                  {h.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {h.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
