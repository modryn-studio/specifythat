import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SiteSchema } from '@/components/site-schema';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import FeedbackWidget from '@/components/feedback-widget';
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
    // Next.js auto-discovers src/app/icon.png — no manual icon array needed
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('specifythat:theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}})();`,
          }}
        />
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
        <SiteNav />
        {children}
        <SiteFooter />
        <FeedbackWidget />
        <Analytics />
      </body>
    </html>
  );
}
