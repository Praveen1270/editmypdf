import { Lock } from "lucide-react";

interface PrivacyBadgeProps {
  className?: string;
}

export function PrivacyBadge({ className = "" }: PrivacyBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-xs text-text-secondary ${className}`}
    >
      <Lock className="h-3.5 w-3.5 shrink-0 text-text-primary" />
      <span>
        <strong className="font-semibold text-text-primary">Your files stay on your device.</strong> All
        PDF processing happens locally in your browser. We never upload your documents.
      </span>
    </div>
  );
}
