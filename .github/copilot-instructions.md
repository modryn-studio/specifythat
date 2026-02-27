# SpecifyThat — Copilot Context

## Who I Am
Luke Hanner — solo builder, shipping AI-assisted tools fast. SpecifyThat turns a vague project idea into a build-ready spec document in under 60 seconds. It runs a 13-question interview, auto-generates most answers with AI, and outputs structured markdown ready to paste into any AI coding assistant. Built for solo builders and small teams who skip the planning step, get stuck, and need the output without the process.

## Stack
- Next.js 16 (App Router) with TypeScript
- Tailwind CSS v4 for styling
- Vercel for deployment
- GA4 for custom event tracking (via `@/lib/analytics.ts` — never call `gtag()` directly)
- Vercel Analytics `<Analytics />` component in `layout.tsx` for pageviews only — do not use their `track()` API
- `openai` — LLM proxy calls (analyze-project, generate-answer, generate-spec, generate-project-description)
- `lucide-react` — icons
- CSS animations from `globals.css` — fade-in, fade-up, shimmer, dot-pulse (framer-motion removed in issue #6)
- `zustand` — client-side state management with localStorage persistence (**not yet installed**)
- `nanoid` — ID generation for specs and sessions (**not yet installed**)
- `nodemailer` + `resend` — feedback email and newsletter contacts

## Project Structure
```
/app                    → Next.js App Router pages
/components             → Reusable UI components
/lib                    → Utilities, helpers, data fetching
/hooks                  → useInterviewSession state machine
/stores                 → Zustand stores (session, specs, preferences)
/docs                   → Brand guide, roadmap, build log
```

Key lib files:
- `src/lib/storage.ts` — versioned localStorage wrapper (namespaced `specifythat:*`, schema migrations)
- `src/lib/questions.ts` — 13 hardcoded questions with AI context
- `src/lib/sanitize.ts` — gibberish detection, input validation
- `src/lib/specTemplate.ts` — answer-to-spec markdown builder
- `src/lib/types.ts` — all TypeScript interfaces

## Route Map
- `/`              → Landing page — hero, feature cards, CTA to start
- `/interview`     → Main interview flow (client component, state machine)
- `/specs`         → Spec history — all saved specs with search, re-download, export/import
- `/privacy`       → Privacy policy
- `/terms`         → Terms of service

## Architecture Notes

**Local-first proxy pattern.** API routes are thin proxies: validate rate limit → forward to OpenAI → return response. The server never logs, stores, or inspects prompt content. Honest claim: "Your prompts are never stored on our servers."

**No accounts.** No signup, no email required to use the tool.

**Persistence:** `localStorage` only, namespaced as `specifythat:*`. Specs survive refresh and browser close. Lost only on "clear site data". See `src/lib/storage.ts`.

**Free trial:** IP-based rate limiting (e.g. 5 specs/day). No billing until analytics show sustained rate limit hits. Stripe credits are a future feature, not current.

**API route proxy shape:**
```typescript
// Every AI route follows this pattern
export async function POST(req: Request) {
  const ctx = log.begin();
  try {
    const body = await req.json(); // parse structure only — never log content
    const ip = getClientIP(req);
    if (isRateLimited(ip)) return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
    const result = await openai.chat.completions.create({ ... });
    return log.end(ctx, Response.json({ result })); // log metadata only, never content
  } catch (error) {
    log.err(ctx, error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## Brand & Voice

**Voice:**
- Short sentences. Direct. No jargon.
- Conversational but competent — like a sharp friend who happens to know product strategy
- Confident without being arrogant. The tool does the work; the copy just explains it.
- Honest about limitations — state them plainly, never hide them
- Never use: "powerful", "seamless", "revolutionary", "unlock", "AI-powered", "AI-first"
- Lead with the outcome (build-ready spec in 60 seconds), not the technology

**Target user:** Solo builders who have an idea and want to start coding — not write a spec. They know planning matters but skip it because it feels like homework. They want the output without the process.

**Visual rules:**
- Dark mode base (warm grays, ChatGPT-like palette) — no light mode toggle
- Accent: Indigo (`#6366f1` primary, `#4f46e5` hover)
- Font: Inter (body + headings) — NOT Geist. Inter is the decision. Align all references.
- Motion: Purposeful only — progress animations during AI generation, fade-ins on phase transitions. Use CSS animations from globals.css. No framer-motion. No decorative motion.
- Avoid: No stock photos, no fake testimonials, no popups, no vanity metrics before you have them

**Emotional arc:**
- Land → "Oh, this actually does the part I always skip"
- Start → "That was easy — I just described my idea"
- Generate → "It's asking the right questions. Better than I would."
- Finish → "I have a spec I can actually use. That took 2 minutes."
- Return → "I use this every time I start something new"

**Copy reference:**
- Hero: "Turn a vague idea into a build-ready spec in under 60 seconds."
- CTA: "Start a spec"
- Empty state: "Describe your project in a few sentences. We'll handle the rest."
- Ideation mode: "Not sure what to build? We'll figure it out together."
- Spec complete: "Your spec is ready. Copy it, download it, paste it into your AI tool."
- Rate limit: "You've used your free specs today. Get credits to keep going."
- Error: "Something went wrong. Try again."
- Footer: "Your prompts never leave your device."

## API Route Logging

Every new API route (`app/api/**/route.ts`) MUST use `createRouteLogger` from `@/lib/route-logger`.

```typescript
import { createRouteLogger } from '@/lib/route-logger';
const log = createRouteLogger('my-route');

export async function POST(req: Request): Promise<Response> {
  const ctx = log.begin();
  try {
    log.info(ctx.reqId, 'Request received', { /* key fields */ });
    // ... handler body ...
    return log.end(ctx, Response.json(result), { /* key result fields */ });
  } catch (error) {
    log.err(ctx, error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

- `begin()` prints the `─` separator + START line with a 5-char `reqId`
- `info()` / `warn()` log mid-request milestones
- `end()` logs ✅ with elapsed ms and returns the response
- `err()` logs ❌ with elapsed ms
- Never use raw `console.log` in routes — always go through the logger

## Analytics

All custom events MUST go through `analytics` from `@/lib/analytics.ts` — never call `gtag()` directly.

```typescript
import { analytics } from '@/lib/analytics';
analytics.track('event_name', { prop: value });
```

Add a named method to `analytics.ts` for each distinct user action. Named methods are typed and discoverable — no magic strings scattered across 10 files.

GA4 measurement ID is loaded via `NEXT_PUBLIC_GA_MEASUREMENT_ID` in `layout.tsx`.

## Dev Server

Start with `Ctrl+Shift+B` (default build task). This runs:
```
npm run dev -- --port 3000 2>&1 | Tee-Object -FilePath dev.log
```
Tell Copilot **"check logs"** at any point — it reads `dev.log` and flags errors or slow requests.

## Code Style
- Write as a senior engineer: minimal surface area, obvious naming, no abstractions before they're needed
- Comments explain WHY, not what
- One file = one responsibility
- Prefer early returns for error handling
- Never break existing functionality when adding new features
- Leave TODO comments for post-launch polish items

## Core Rules
- Every page earns its place — no pages for businesses not yet running
- Ship fast, stay honest — empty is better than fake
- Ugly is acceptable, broken is not — polish the core action ruthlessly
- Ship one killer feature, not ten mediocre ones
- Instrument analytics before features — data from day one
- Onboard users to value in under 2 minutes
