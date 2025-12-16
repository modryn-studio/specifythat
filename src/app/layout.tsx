import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SpecifyThat - Turn Ideas Into Build-Ready Specs",
  description: "Stop staring at a blank page. SpecifyThat asks the right questions and fills gaps with top 0.1% thinking. Go from idea to building in under 30 minutes.",
  keywords: ["project spec", "specification generator", "AI tools", "developer tools", "project planning"],
  authors: [{ name: "SpecifyThat" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://specifythat.com'),
  openGraph: {
    title: "SpecifyThat - Turn Ideas Into Build-Ready Specs",
    description: "Stop staring at a blank page. SpecifyThat asks the right questions and fills gaps with top 0.1% thinking. Go from idea to building in under 30 minutes.",
    type: "website",
    siteName: "SpecifyThat",
  },
  twitter: {
    card: 'summary_large_image',
    title: "SpecifyThat - Turn Ideas Into Build-Ready Specs",
    description: "Stop staring at a blank page. Get from idea to building in under 30 minutes with AI-powered project specs.",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
