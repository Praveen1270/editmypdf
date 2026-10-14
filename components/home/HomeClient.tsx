"use client";

import React from "react";
import { DocumentDropzone } from "./DocumentDropzone";
import { ToolDirectory } from "./ToolDirectory";

export function HomeClient() {
  return (
    <div className="w-full bg-background text-foreground transition-colors pb-20">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        {/* 1. Distinctive Welcome Area (Section 4.B) */}
        <div className="max-w-2xl text-left mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-foreground leading-[1.15]">
            Your PDFs. Sorted.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Edit, organize, convert, and export your documents in one simple workspace.
          </p>
        </div>

        {/* 2. Document-First Upload Surface (Section 4.C) */}
        <DocumentDropzone />

        {/* 3. Original Structured Tool Discovery System (Section 5) */}
        <ToolDirectory />
      </div>
    </div>
  );
}
