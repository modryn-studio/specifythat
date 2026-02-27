// Single source of truth for all site-wide metadata.
// /init fills this in from context.md + brand.md.
// Every other file imports from here — never hardcode site metadata elsewhere.
export const site = {
  name: 'TODO: site name',
  shortName: 'TODO',
  url: 'https://DOMAIN.com', // TODO: replace with actual domain
  // Base description — used in <meta description>, manifest, JSON-LD
  description: 'TODO: meta description (110–160 chars)',
  // Longer form for social cards
  ogTitle: 'TODO: OG title (50–60 chars)',
  ogDescription: 'TODO: OG description (110–160 chars)',
  founder: 'TODO: founder name',
  // Brand colors — used in manifest theme_color / background_color
  accent: '#F97415', // TODO: brand accent hex
  bg: '#050505', // TODO: brand background hex
} as const;
