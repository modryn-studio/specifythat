// Single source of truth for all site-wide metadata.
// Populated by /init from context.md + brand.md.
// Every other file imports from here — never hardcode site metadata elsewhere.
export const site = {
  name: 'SpecifyThat',
  shortName: 'SpecifyThat',
  url: 'https://specifythat.com',
  // Base description — used in <meta description>, manifest, JSON-LD
  description:
    'Get the context file your AI coding tool needs. Describe your idea, answer a few questions, and get a copilot-instructions.md file in 60 seconds. No account required.',
  // Longer form for social cards
  ogTitle: 'SpecifyThat | Context Files for AI Coding Tools',
  ogDescription:
    'Describe your idea. AI asks the right questions. Get a copilot-instructions.md file you can paste straight into your editor. Under 60 seconds, no signup.',
  founder: 'Luke Hanner',
  // Brand colors — indigo accent, warm dark base
  accent: '#6366f1',
  bg: '#111111',
} as const;
