---
name: init
description: Reads context.md, development-principles.md, and brand.md, then fills in copilot-instructions.md and site.ts for a new project
agent: agent
---

Read the following files from the workspace root:
1. `context.md` — project-specific facts: product name, what it does, who it's for, stack additions, and routes
2. `development-principles.md` — product philosophy to inform tone
3. `brand.md` — voice, visual rules, target user, emotional arc, and copy examples

Then edit `.github/copilot-instructions.md` and replace every `<!-- TODO -->` section with real content:

- **[Project Name]** — the product name from context.md
- **Who I Am** — 2–4 sentences: who Luke is, what the product does, who it's for. Use development-principles.md for tone (fast shipper, AI-assisted builder, micro-niche focus).
- **Stack** — read `package.json` as the source of truth: list only what is actually installed. Use context.md for planned/future additions and flag them as "not yet installed". Never list something as part of the stack if it isn't in `package.json`.
- **Project Structure** — keep `/app`, `/components`, `/lib`. Add any project-specific directories from context.md. Remove the `<!-- TODO -->` comment.
- **Route Map** — list every route from context.md with a one-line description. Always include `/privacy` and `/terms`.
- **Brand & Voice** — populate from brand.md: voice rules, visual rules (colors, fonts, motion), target user description, emotional arc, and copy examples to use as reference.

Also fill in `src/config/site.ts` — replace every `TODO:` placeholder with real content from context.md and brand.md:
- `name` / `shortName` — product name from context.md
- `url` — domain from context.md (use `https://` prefix)
- `description` — 110–160 char meta description that describes what the product does and who it's for
- `ogTitle` — 50–60 char title formatted as "Product Name | Short Value Prop"
- `ogDescription` — 110–160 char OG description, slightly more marketing-forward than the meta description
- `founder` — from context.md or default to "Luke Hanner"
- `accent` / `bg` — brand colors from brand.md (hex values)

Do not modify any section without a `<!-- TODO -->` marker.
Do not add new sections.
Do not touch API Route Logging, Analytics, Dev Server, Code Style, or Core Rules.

Finally, wire `FeedbackWidget` into `src/app/layout.tsx`:
- Add `import FeedbackWidget from '@/components/feedback-widget'` with the other component imports
- Add `<FeedbackWidget />` as the last child inside the root layout wrapper div, after `<Footer />`
- This must be present in every project — it's how Luke collects feedback from day one

After editing, confirm what was filled in and flag anything that was missing from context.md or brand.md that Luke should provide.
