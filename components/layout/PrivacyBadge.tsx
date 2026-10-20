import { ShieldCheck } from "lucide-react";

interface PrivacyBadgeProps {
  className?: string;
}

export function PrivacyBadge({ className = "" }: PrivacyBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 ${className}`}
    >
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-black dark:text-white stroke-[2]" />
      <span>
        <strong className="font-bold text-black dark:text-white">Your files stay on your device.</strong> All
        PDF processing happens locally in your browser. Files are never uploaded.
      </span>
    </div>
  );
}
