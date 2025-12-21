import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SpecifyThat | Planning & Prompt Engine",
  description: "Transform raw ideas into build-ready specs in under 60 seconds. Optimized for Cursor, Claude, ChatGPT, Bolt, v0 & Emergent.",
  keywords: ["spec generator", "AI", "project planning", "prompt engineering", "development specs"],
  authors: [{ name: "SpecifyThat" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://specifythat.com'),
  openGraph: {
    title: "SpecifyThat | Planning & Prompt Engine",
    description: "Transform raw ideas into build-ready specs in under 60 seconds",
    type: "website",
    siteName: "SpecifyThat",
  },
  twitter: {
    card: 'summary_large_image',
    title: "SpecifyThat | Planning & Prompt Engine",
    description: "Transform raw ideas into build-ready specs in under 60 seconds",
    creator: '@specifythat',
    site: '@specifythat',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-dark-900 text-white antialiased`}>
        <GoogleAnalytics />
        
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-dark-900 via-dark-900 to-accent-900/20 pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
