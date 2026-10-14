import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";
import { Analytics } from "@vercel/analytics/react";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F6F2" },
    { media: "(prefers-color-scheme: dark)", color: "#161614" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://editmypdf.local"),
  title: {
    default: "EditMyPDF — Free Online PDF Tools",
    template: "%s | EditMyPDF",
  },
  description:
    "Merge, split, compress, convert, rotate, protect, and edit PDF files directly in your browser. 100% local processing. Files never leave your device.",
  applicationName: "EditMyPDF",
  authors: [{ name: "EditMyPDF Team" }],
  creator: "EditMyPDF",
  publisher: "EditMyPDF",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://editmypdf.local",
    siteName: "EditMyPDF",
    title: "EditMyPDF — Privacy-First PDF Tools in Your Browser",
    description:
      "20 free, private PDF utilities running 100% locally in your browser. Merge, split, compress, protect, and convert without file uploads.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "EditMyPDF — Privacy-First PDF Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EditMyPDF — Privacy-First PDF Tools in Your Browser",
    description:
      "20 free, private PDF utilities running 100% locally in your browser. Zero uploads, offline ready.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/logo.png?v=2" },
      { url: "/favicon.ico?v=2" },
      { url: "/favicon-32x32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=2", sizes: "16x16", type: "image/png" },
      { url: "/icon.svg?v=2", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo.png?v=2", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" },
    ],
  },
  keywords: [
    "pdf tools",
    "merge pdf",
    "split pdf",
    "compress pdf",
    "pdf to images",
    "images to pdf",
    "rotate pdf",
    "watermark pdf",
    "protect pdf",
    "unlock pdf",
    "privacy-first pdf",
    "offline pdf",
    "client-side pdf editor",
  ],
  verification: {
    google: "DC5CGvnpF5XdSlTt6N7RZ9KqCbhsTYp9es7SttfqSL4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <meta
          name="google-site-verification"
          content="DC5CGvnpF5XdSlTt6N7RZ9KqCbhsTYp9es7SttfqSL4"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('editmypdf-theme')||localStorage.getItem('pdfkit-theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground antialiased font-sans">
        <ThemeProvider>
          <PwaProvider>
            {/* Hidden install button so AppShell can invoke it */}
            <div className="hidden">
              <InstallAppButton id="editmypdf-hidden-install-btn" />
            </div>
            <AppShell>{children}</AppShell>
          </PwaProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
