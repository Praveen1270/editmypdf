import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  markSize?: number;
  showWordmark?: boolean;
  linkToHome?: boolean;
}

export function BrandLogo({
  className = "",
  showWordmark = true,
  linkToHome = true,
}: BrandLogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src="/logo.png?v=2"
        alt="EditMyPDF Logo"
        width={32}
        height={32}
        className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 object-contain"
      />
      {showWordmark && (
        <span className="font-sans text-base sm:text-lg font-bold tracking-tight text-foreground">
          EditMyPDF
        </span>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link
        href="/"
        className="inline-flex items-center rounded-lg transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="EditMyPDF Homepage"
      >
        {content}
      </Link>
    );
  }

  return content;
}
