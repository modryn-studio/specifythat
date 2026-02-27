// Single source of truth for all site-wide metadata.
// Populated by /init from context.md + brand.md.
// Every other file imports from here — never hardcode site metadata elsewhere.
export const site = {
  name: 'SpecifyThat',
  shortName: 'SpecifyThat',
  url: 'https://specifythat.com',
  // Base description — used in <meta description>, manifest, JSON-LD
  description:
    'Turn a vague idea into a build-ready spec in 60 seconds. Answer two questions — AI handles the rest. No account, no signup required.',
  // Longer form for social cards
  ogTitle: 'SpecifyThat | Turn Your Idea Into a Build-Ready Spec',
  ogDescription:
    'Stop skipping the spec. SpecifyThat interviews you, generates the answers, and outputs a structured document ready to paste into any AI coding tool.',
  founder: 'Luke Hanner',
  // Brand colors — indigo accent, warm dark base
  accent: '#6366f1',
  bg: '#111111',
} as const;
