import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Contact & Support — PDFKit",
  description:
    "Get in touch with the PDFKit team for technical support, feature requests, security disclosures, and feedback.",
  canonical: "/contact",
  keywords: ["contact pdfkit", "pdf tools support", "privacy pdf help"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
