---
name: "SEO Rules"
description: "Metadata exports, Open Graph, semantic HTML, heading hierarchy, and accessibility rules"
applyTo: "**/*.ts,**/*.tsx"
---
# SEO Rules

## Metadata
- Every route must export a `metadata` object or `generateMetadata` function.
- Include `title`, `description`, and `openGraph` in all metadata.
- OG title: 50–60 characters max.
- OG description: 110–160 characters max.
- OG image: 1200×630px, referenced as `/og-image.png`. Use a dedicated OG image — never the README banner.
- OG must include `title`, `description`, `images` (with `url`, `width`, `height`, `alt`), and `siteName`.
- Add a `twitter` block with `card: 'summary_large_image'`.
- Set `metadataBase` in the root `layout.tsx` to the production domain.

## JSON-LD Structured Data
- Add a `SoftwareApplication` JSON-LD script to the root `layout.tsx`.
- Minimum fields: `name`, `description`, `applicationCategory`, `operatingSystem`, `url`.
- Use a `<script type="application/ld+json">` tag inside the layout body.

## HTML
- Use semantic HTML5 elements: `<main>`, `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`.
- One `<h1>` per page. Headings must follow sequential order (h1 → h2 → h3).
- Target keyword should appear in the first 100 words of body copy.
- All images must have descriptive `alt` text — never empty.
- No render-blocking JavaScript — keep client components minimal.
- Use `<Link>` with descriptive anchor text — avoid "click here".
