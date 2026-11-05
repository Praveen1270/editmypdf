// ---------------------------------------------------------------------------
// DERIVED SHIM — do not add content here.
//
// TOOL_CONTENT used to be a second, hand-maintained copy of per-tool guides
// (steps, FAQs, tips, notes). The single copy now lives on the ToolItem in
// lib/tools-data.ts (fields intro / guideSteps / tips / notes / privacy /
// valueProp / faq). This module only reshapes registry entries into the
// ToolContentData shape the 10 ToolContent pages import, so those pages keep
// working unchanged. Delete this file once those pages read the registry
// directly. VALUE_PROPS, WORKFLOW_DESCRIPTIONS and HOMEPAGE_ABOUT were dead
// (zero importers) and are gone.
// ---------------------------------------------------------------------------

import { PDF_TOOLS } from "./tools-data";
import type { ToolContentData } from "@/components/tools/ToolContent";

const entries: [string, ToolContentData][] = PDF_TOOLS.filter((t) => t.intro !== undefined).map(
  (t): [string, ToolContentData] => [
    t.id,
    {
      title: t.guideTitle ?? t.name,
      intro: t.intro ?? t.description,
      steps: t.guideSteps ?? t.steps.map((s) => `${s.title}: ${s.desc}`),
      ...(t.tips ? { tips: t.tips } : {}),
      ...(t.notes ? { notes: t.notes } : {}),
      faqs: t.faq,
      ...(t.privacy ? { privacy: t.privacy } : {}),
      ...(t.valueProp ? { valueProp: t.valueProp } : {}),
    },
  ]
);

export const TOOL_CONTENT: Record<string, ToolContentData> = Object.fromEntries(entries);
