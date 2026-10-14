import Link from "next/link";
import { ArrowRight, Files, Scissors, Minimize2, Image, FileImage, RotateCw, Hash, Stamp, Lock, Unlock, Crop, Scaling, Eye, Search, Layers, ShieldCheck, Binary, SlidersHorizontal, FileText } from "lucide-react";
import { PDF_TOOLS } from "@/lib/tools-data";

const ICON_MAP: Record<string, any> = {
  Files,
  Scissors,
  Minimize2,
  Image,
  FileImage,
  RotateCw,
  Hash,
  Stamp,
  Lock,
  Unlock,
  Crop,
  Scaling,
  Eye,
  Search,
  Layers,
  ShieldCheck,
  Binary,
  SlidersHorizontal,
  FileText,
};

interface RelatedToolsProps {
  currentToolId: string;
}

export function RelatedTools({ currentToolId }: RelatedToolsProps) {
  const related = PDF_TOOLS.filter((t) => t.id !== currentToolId).slice(0, 4);

  return (
    <section className="mt-14 border-t border-border pt-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
            Explore More PDF Tools
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            All 20 utilities run 100% locally in browser memory.
          </p>
        </div>
        <Link
          href="/#tools"
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
        >
          <span>View all tools</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((tool) => {
          const Icon = ICON_MAP[tool.iconName] || Files;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 transition hover:border-border-strong hover:bg-surface-subtle shadow-paper"
            >
              <div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-subtle text-foreground transition-colors group-hover:bg-accent group-hover:text-white group-hover:border-accent">
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="mt-3 text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                  {tool.name}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {tool.shortDesc}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-foreground">
                <span>Open tool</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
