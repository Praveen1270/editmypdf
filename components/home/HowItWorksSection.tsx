import React from "react";
import { UploadCloud, Cpu, Download } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Select your document",
    description: "Choose files directly from your computer, tablet, or phone, or drop them right into the tool.",
    icon: UploadCloud,
  },
  {
    step: "02",
    title: "Instant local processing",
    description: "Your browser runs the processing logic in RAM using WebAssembly and Web Crypto. No server upload.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Download instantly",
    description: "Save your finished PDF in full quality without watermarks, waiting queues, or daily limits.",
    icon: Download,
  },
];

export function HowItWorksSection() {
  return (
    <section className="mt-20 pt-12 border-t border-border">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent mb-3">
          Simple & Fast
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          How EditMyPDF Works
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Perform complete PDF modifications right in your browser in three effortless steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="relative rounded-2xl border border-border bg-surface p-6 shadow-paper hover:shadow-paper-elevated transition duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-2xl font-black text-muted-foreground/30">
                  {s.step}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">
                {s.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
