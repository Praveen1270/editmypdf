import { ShieldCheck } from "lucide-react";

interface PrivacyBadgeProps {
  className?: string;
}

export function PrivacyBadge({ className = "" }: PrivacyBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border border-border bg-surface-subtle px-3 py-1.5 text-xs text-muted-foreground ${className}`}
    >
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent" />
      <span>
        <strong className="font-semibold text-foreground">Your files stay on your device.</strong> All
        PDF processing happens locally in your browser. Files are never uploaded.
      </span>
    </div>
  );
}
