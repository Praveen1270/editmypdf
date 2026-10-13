import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recent Files",
  description: "View and manage recent PDF files processed locally in your browser.",
};

export default function RecentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
