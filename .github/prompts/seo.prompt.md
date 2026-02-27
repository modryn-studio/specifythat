---
name: seo
description: "Pre-launch SEO checklist: validate OG tags, register with search engines, submit sitemap."
agent: ask
---
# SEO Launch Checklist

Walk me through the SEO launch steps for this project. First auto-generate any missing required files, then audit the full codebase, then guide me through the external steps I need to do manually.

## Step 0: Auto-Generate Missing Files
Before auditing, check for and CREATE the following files if they are absent:

**`src/app/sitemap.ts`** — if missing, create it. First check whether `@/config/site` exists — if it does, import `site.url`; otherwise hardcode the domain from `layout.tsx`:
```ts
import { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    // add remaining static routes from app/ directory
  ];
  return staticRoutes;
}
```
Adapt as needed for any dynamic routes (log posts, tool pages, etc.).

**`src/app/robots.ts`** — if missing (do NOT create `public/robots.txt`), create it:
```ts
import { MetadataRoute } from 'next';
import { site } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
```

**Favicon files** — if `src/app/favicon.ico`, `src/app/icon.png`, or `src/app/apple-icon.png` are missing:
1. Check if `public/brand/logomark.png` exists (1024×1024 recommended).
2. If it does and ImageMagick (`magick`) is available, run in PowerShell:
   ```powershell
   # Multi-resolution favicon.ico (16/32/48px)
   magick public\brand\logomark.png -define icon:auto-resize=48,32,16 src\app\favicon.ico
   # icon.png and apple-icon.png for Next.js App Router
   Copy-Item public\brand\logomark.png src\app\icon.png
   Copy-Item public\brand\logomark.png src\app\apple-icon.png
   ```
3. If `public/brand/logomark.png` is absent, tell the user: "Drop your 1024×1024 logomark at `public/brand/logomark.png` and re-run `/seo` to auto-generate favicons."
4. Ensure `layout.tsx` metadata includes:
   ```ts
   metadataBase: new URL("https://DOMAIN.com"),
   icons: { icon: "/icon.png", apple: "/apple-icon.png" },
   ```

**`src/config/site.ts`** — if missing, create it by reading the site name, URL, description, OG copy, and brand colors from `layout.tsx` and `copilot-instructions.md`:
```ts
// Single source of truth for all site-wide metadata.
export const site = {
  name: '<site name>',
  shortName: '<abbreviated name>',
  url: 'https://<domain>',
  description: '<meta description (110–160 chars)>',
  ogTitle: '<OG title (50–60 chars)>',
  ogDescription: '<OG description (110–160 chars)>',
  founder: '<founder name>',
  accent: '<brand accent hex, e.g. #F97415>',
  bg: '<brand bg hex, e.g. #050505>',
} as const;
```
Then update `layout.tsx` to import `site` and replace all hardcoded strings. Remove `manifest: '/manifest.json'` from the metadata export (Next.js auto-injects it from `manifest.ts`).

**`src/app/manifest.ts`** — if missing, create it (Next.js serves this at `/manifest.webmanifest` automatically — do NOT create `public/manifest.json`):
```ts
import { MetadataRoute } from 'next';
import { site } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: '/',
    display: 'standalone',
    background_color: site.bg,
    theme_color: site.accent,
    icons: [{ src: '/icon.png', sizes: '1024x1024', type: 'image/png', purpose: 'any maskable' }],
  };
}
```

**`src/components/site-schema.tsx`** — if missing, create it and add `<SiteSchema />` inside `<body>` in `layout.tsx`:
```tsx
import { site } from '@/config/site';

export function SiteSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([
          { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url, description: site.description },
          { '@context': 'https://schema.org', '@type': 'Organization', name: site.name, url: site.url, logo: `${site.url}/icon.png`, description: site.description, founder: { '@type': 'Person', name: site.founder } },
        ]),
      }}
    />
  );
}
```

Report which files were created vs already existed.

## Step 1: Code Audit
Check the codebase for:
- [ ] `layout.tsx` has `metadataBase`, `title`, `description`, `openGraph`, `twitter`, `manifest`
- [ ] `layout.tsx` has `icons` field pointing to `/icon.png` and `/apple-icon.png`
- [ ] `src/app/favicon.ico` exists (multi-resolution, from logomark)
- [ ] `src/app/icon.png` exists (1024×1024 logomark)
- [ ] `src/app/apple-icon.png` exists
- [ ] OG title is 50–60 chars, description is 110–160 chars
- [ ] `public/og-image.png` exists (1200×630px)
- [ ] `src/config/site.ts` exists and is fully filled in (no placeholder values)
- [ ] `src/app/manifest.ts` exists (do NOT check for `public/manifest.json`)
- [ ] `src/app/robots.ts` exists (do NOT check for `public/robots.txt`)
- [ ] `src/components/site-schema.tsx` exists and `<SiteSchema />` is rendered in `layout.tsx`
- [ ] `src/app/sitemap.ts` exists and lists all public routes
- [ ] `package.json` has a `description` field

Report PASS / MISSING for each item with file paths for anything missing.

## Step 2: Manual Launch Steps (guide me through these)

### Google Search Console
1. Go to https://search.google.com/search-console
2. Add property → Domain → enter your domain
3. Verify via DNS TXT record:
   - Vercel dashboard → click your **team name** (not a project) → left nav: **Domains**
   - Click the domain → **Advanced Settings** → **Add Record**
   - Type: TXT | Name: @ | Value: `google-site-verification=...` | TTL: 60
   - Wait 5–30 min, then click Verify in Search Console
4. After verification → Sitemaps → submit `https://yourdomain.com/sitemap.xml`

### Bing Webmaster Tools
1. Go to https://www.bing.com/webmasters
2. Sign in with Microsoft account
3. Select **Import from Google Search Console** — pulls your site and sitemap automatically
4. Done (also covers Yahoo and DuckDuckGo which use Bing's index)

## Step 3: Validation
Tell me to check these once the site is deployed:
- **OG preview:** https://opengraph.xyz — paste the live URL, verify title 50–60 chars, description 110–160 chars, image 1200×630
- **JSON-LD:** https://search.google.com/test/rich-results — should show "1 valid item detected"
- **DNS propagation:** https://www.whatsmydns.net — check TXT record has propagated
