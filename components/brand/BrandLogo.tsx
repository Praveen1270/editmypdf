import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  markSize?: number;
  showWordmark?: boolean;
  linkToHome?: boolean;
}

export function BrandMark({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Document page silhouette with upper-right fold */}
      <path
        d="M7 4C5.89543 4 5 4.89543 5 6V26C5 27.1046 5.89543 28 7 28H23C24.1046 28 25 27.1046 25 26V12L17 4H7Z"
        fill="currentColor"
        className="text-foreground"
      />
      {/* Folded paper corner */}
      <path
        d="M17 4V12H25L17 4Z"
        fill="currentColor"
        className="text-background opacity-60"
      />
      {/* Minimal document content lines */}
      <line
        x1="9.5"
        y1="16"
        x2="15.5"
        y2="16"
        stroke="var(--background)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <line
        x1="9.5"
        y1="20"
        x2="13.5"
        y2="20"
        stroke="var(--background)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Precise editing action badge (pen node in cobalt blue) */}
      <rect
        x="17"
        y="17"
        width="10"
        height="10"
        rx="3"
        fill="#315EFB"
      />
      <path
        d="M20 23.5L20.8 20.5L24 17.5L25.5 19L22.5 22L19.5 23L20 23.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function BrandLogo({
  className = "",
  markSize = 26,
  showWordmark = true,
  linkToHome = true,
}: BrandLogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <BrandMark size={markSize} />
      {showWordmark && (
        <span className="font-sans text-base sm:text-[17px] font-semibold tracking-[-0.02em] text-foreground flex items-center">
          <span>Edit</span>
          <span className="font-normal text-muted-foreground mx-0.5">My</span>
          <span className="font-bold text-foreground">PDF</span>
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
