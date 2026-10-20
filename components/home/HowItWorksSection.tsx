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
    <section className="mt-20 pt-12 border-t border-zinc-200 dark:border-zinc-800">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-1 text-xs font-bold text-black dark:text-white mb-3">
          Simple & Fast
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black dark:text-white">
          How EditMyPDF Works
        </h2>
        <p className="mt-2 text-sm text-[#52504e] dark:text-[#d6d3d1] leading-relaxed">
          Perform complete PDF modifications right in your browser in three effortless steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-md hover:border-black dark:hover:border-white transition duration-150"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white">
                  <Icon className="h-5 w-5 text-black dark:text-white stroke-[2]" />
                </div>
                <span className="font-mono text-2xl font-black text-zinc-300 dark:text-zinc-700">
                  {s.step}
                </span>
              </div>
              <h3 className="text-base font-bold text-black dark:text-white mb-2">
                {s.title}
              </h3>
              <p className="text-xs text-[#52504e] dark:text-[#d6d3d1] leading-relaxed">
                {s.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
