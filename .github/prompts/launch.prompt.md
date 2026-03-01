---
name: launch
description: "Distribution checklist: sharing hooks, dynamic OG images, social footer, community posting guide."
agent: ask
---
# Launch Distribution

Walk me through the distribution launch for this project. First fix what the codebase is missing, then audit what's in place, then guide me through where to post on launch day.

Run this after `/seo` (which handles technical SEO). This covers getting eyes on the product — sharing hooks, social presence, and community posting.

## Step 0: Auto-Fix Codebase

Check and implement the following if missing:

**`site.ts` social block** — if `site.social` is missing or contains TODO values, populate it from the Social Profiles section of `context.md`:
```ts
social: {
  twitter: 'https://x.com/<handle>',
  twitterHandle: '@<handle>',
  github: 'https://github.com/<org-or-user>',
  // devto, shipordie, etc. if listed in context.md
},
```
If `context.md` has no social profiles filled in, ask the user for their X/Twitter handle before proceeding.

**`twitter:site` in `layout.tsx`** — if `twitter.site` is missing from the Twitter card metadata, add it:
```ts
twitter: {
  card: 'summary_large_image',
  site: site.social.twitterHandle,
  title: site.ogTitle,
  description: site.ogDescription,
  images: ['/og-image.png'],
},
```

**Footer social links** — check whether the site footer includes links to the social profiles in `site.social`. If not, add `<a>` tags for X/Twitter and GitHub at minimum. Use `site.social.*` as the source — never hardcode URLs. Example:
```tsx
<a href={site.social.twitter} target="_blank" rel="noopener noreferrer">X</a>
<a href={site.social.github} target="_blank" rel="noopener noreferrer">GitHub</a>
```

**Modryn Studio footer credit** — check whether the footer copyright includes a link to `modrynstudio.com`. If not, update it:
```tsx
© {new Date().getFullYear()} {site.name} · <a href="https://modrynstudio.com" target="_blank" rel="noopener noreferrer">Modryn Studio</a>
```

**Dynamic OG images** — check whether `src/app/opengraph-image.tsx` exists. If not, create it using `next/og` `ImageResponse`. Also check key non-home pages (e.g. `/how-it-works`, `/about`, any tool/product page) — if they only inherit the root OG image, generate per-page `opengraph-image.tsx` files with headlines that match each page's purpose:
```tsx
import { ImageResponse } from 'next/og';
import { site } from '@/config/site';

// IMPORTANT: Remove `export const runtime = 'edge'` if this image reads from the
// filesystem (e.g. MDX files, JSON content directories). Edge runtime cannot use
// Node.js APIs — use it only for purely static OG images that don't read files.
export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ background: site.bg, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 58, fontWeight: 700, color: '#ffffff', textAlign: 'center', lineHeight: 1.1, marginBottom: 24 }}>
          {/* page-specific headline */}
        </div>
        <div style={{ fontSize: 22, color: '#a1a1aa', textAlign: 'center', maxWidth: 700 }}>
          {/* page-specific subtext */}
        </div>
        <div style={{ position: 'absolute', bottom: 40, right: 60, fontSize: 18, color: site.accent, fontWeight: 600 }}>
          {/* domain — e.g. site.url.replace('https://', '') */}
        </div>
      </div>
    ),
    { ...size },
  );
}
```

**Sharing hook at outcome** — check the success / done state of the main user flow (the screen shown after the core action completes). If there is no share button or link, add a pre-filled X/Twitter share link:
```tsx
// Pre-filled tweet — edit text to match brand voice from copilot-instructions.md
const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent('Your message here — keep under 200 chars')}&url=${encodeURIComponent(site.url)}`;

<a href={shareUrl} target="_blank" rel="noopener noreferrer">
  Share on X
</a>
```
The message should come from the brand voice in `copilot-instructions.md` and reference what the user just accomplished. Ask the user to approve the copy before implementing.

**FAQPage schema** — on any long-form educational page (`/how-it-works`, `/about`, `/faq`) that answers questions in H2/H3 sections, check for a `FAQPage` JSON-LD schema. If absent, generate one from the page headings and content:
```tsx
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'H2/H3 heading as question',
      acceptedAnswer: { '@type': 'Answer', text: 'Section content as plain text' },
    },
    // repeat for each H2/H3 section
  ],
};

// In the page component:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
```

Report what was created vs already existed.

## Step 1: Audit
- [ ] `site.ts` has `social` block with real values (no TODOs)
- [ ] `layout.tsx` Twitter card has `site` handle
- [ ] Footer has X/Twitter + GitHub links from `site.social`
- [ ] Footer has Modryn Studio credit linking to modrynstudio.com
- [ ] `src/app/opengraph-image.tsx` exists with correct title/desc
- [ ] Key pages beyond home have per-page `opengraph-image.tsx`
- [ ] Main flow success/done state has a share link
- [ ] Educational/FAQ pages have FAQPage JSON-LD
- [ ] `sitemap.ts` uses static `lastModified` dates (not `new Date()`)

Report PASS / WARN / MISSING for each.

## Step 2: Launch Day Checklist

Go through these in order. Run `/log` first so all links in social posts resolve.

### Build Log — do this first
Run `/log` to draft the launch post for modrynstudio.com. Merge it before the community posts go out so links don't 404.

### Social Copy
Run `/social` with the log post MDX or tool JSON to generate ready-to-paste copy for X, Reddit, shipordie.club, and dev.to.

## Step 3: Validation
Check these are live before posting anywhere:
- **OG preview:** https://opengraph.xyz — paste the live URL, image loads correctly, title/desc match
- **Share link test:** open your pre-filled X share URL in a browser — confirm it pre-fills correctly
- **FAQPage schema:** https://search.google.com/test/rich-results — should show FAQ rich result if implemented
