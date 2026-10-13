import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Contact & Support — EditMyPDF",
  description:
    "Get in touch with the EditMyPDF team for technical support, feature requests, security disclosures, and feedback.",
  canonical: "/contact",
  keywords: ["contact editmypdf", "pdf tools support", "privacy pdf help"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
