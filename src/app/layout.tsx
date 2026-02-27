import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SiteSchema } from '@/components/site-schema';
import { site } from '@/config/site';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.ogTitle,
    template: `%s — ${site.name}`,
  },
  description: site.ogDescription,
  openGraph: {
    type: 'website',
    url: site.url,
    siteName: site.name,
    title: site.ogTitle,
    description: site.ogDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.ogTitle,
    description: site.ogDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <SiteSchema />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
