import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Starred Tools",
  description: "Quick access to your favorite and starred PDF utilities.",
  // Personal, user-specific page: matches robots.txt Disallow for /starred
  robots: { index: false, follow: false },
};

export default function StarredLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
