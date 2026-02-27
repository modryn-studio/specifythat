import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
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
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: site.ogTitle }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.ogTitle,
    description: site.ogDescription,
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon-light.png', media: '(prefers-color-scheme: light)', type: 'image/png' },
      { url: '/icon-dark.png', media: '(prefers-color-scheme: dark)', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
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
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
      </head>
      <body className={inter.className}>
        <SiteSchema />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
