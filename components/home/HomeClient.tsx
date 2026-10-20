"use client";

import React, { useState, useEffect } from "react";
import { HomeHero } from "./HomeHero";
import { DocumentDropzone } from "./DocumentDropzone";
import { ToolDirectory } from "./ToolDirectory";
import { HowItWorksSection } from "./HowItWorksSection";
import { PrivacySecuritySection } from "./PrivacySecuritySection";
import { FaqSection } from "./FaqSection";
import { PopularToolsSection } from "./PopularToolsSection";
import {
  getActiveDocument,
  subscribeActiveDocument,
  ActiveDocumentState,
} from "@/lib/active-document";

export function HomeClient() {
  const [activeDoc, setActiveDoc] = useState<ActiveDocumentState | null>(null);

  useEffect(() => {
    setActiveDoc(getActiveDocument());
    const unsub = subscribeActiveDocument(() => {
      setActiveDoc(getActiveDocument());
    });
    return unsub;
  }, []);

  return (
    <div className="w-full bg-background text-foreground transition-colors pb-24">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        {/* If a document is loaded in memory, render Document Workspace banner; otherwise centered Hero */}
        {activeDoc ? (
          <div className="pt-8 mb-6">
            <DocumentDropzone />
          </div>
        ) : (
          <HomeHero />
        )}

        {/* 3. Category Filter Navigation & 5-Column Responsive Tool Card Grid */}
        <ToolDirectory />

        {/* 4. How It Works (Section 3.E) */}
        <HowItWorksSection />

        {/* 5. Privacy & Security Architecture (Section 3.E) */}
        <PrivacySecuritySection />

        {/* 6. Frequently Asked Questions (Section 3.E) */}
        <FaqSection />

        {/* 7. Popular Tools Shortcuts (Section 3.E) */}
        <PopularToolsSection />
      </div>
    </div>
  );
}
