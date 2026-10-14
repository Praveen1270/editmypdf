import type { Metadata } from "next";
import { generateToolMetadataById } from "@/lib/seo";
import { ToolJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = generateToolMetadataById("edit-pdf");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolJsonLd toolId="edit-pdf" />
      {children}
    </>
  );
}
