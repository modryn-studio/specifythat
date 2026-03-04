# SpecifyThat — Copilot Context

## Who I Am
Luke Hanner — solo builder, shipping AI-assisted tools fast. SpecifyThat generates the context file your AI coding tool needs to understand a project. Describe a vague idea, AI works through 13 strategic questions and returns a pre-filled review screen, edit anything that's wrong, generate. Under 60 seconds. Built for solo builders who skip the planning step and start prompting with zero context.

**Status:** Live at [specifythat.com](https://specifythat.com). Registered on modrynstudio.com. Free tier is IP-based (3 specs/day). No billing until rate limit analytics show demand.

## Stack
- Next.js 16 (App Router) with TypeScript
- Tailwind CSS v4 for styling
- Vercel for deployment
- GA4 for custom event tracking (via `@/lib/analytics.ts` — never call `gtag()` directly)
- Vercel Analytics `<Analytics />` component in `layout.tsx` for pageviews only — do not use their `track()` API
- `openai` — LLM proxy calls (analyze-project, generate-answer, generate-spec, generate-project-description)
- `groq` — OpenAI-compatible client via different `baseURL`; used for speed-critical routes through `getLLM()`
- `lucide-react` — icons
- CSS animations from `globals.css` — fade-in, fade-up, shimmer, dot-pulse (framer-motion removed in issue #6)
- `zustand` — client-side state management with localStorage persistence
- `nanoid` — ID generation for specs and sessions
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
- `src/lib/specTemplate.ts` — answer-to-context-file builder
- `src/lib/types.ts` — all TypeScript interfaces
- `src/lib/llm.ts` — LLM client factory; routes each API call to Groq or OpenAI based on route name
- `src/lib/rate-limit.ts` — in-memory IP rate limiter, per-route stores, 24h window

## Route Map
- `/`              → Landing page — hero, feature cards, CTA to start
- `/interview`     → Main interview flow (client component, state machine)
- `/how-it-works`  → Education page — why context files matter, how SpecifyThat works, where to put the file
- `/specs`         → History — all saved context files with search, re-download, export/import
- `/privacy`       → Privacy policy
- `/terms`         → Terms of use

## Architecture Notes

**Local-first proxy pattern.** API routes are thin proxies: validate rate limit → forward to OpenAI → return response. The server never logs, stores, or inspects prompt content. Honest claim: "Your prompts are never stored on our servers."

**Output is a context file, not a spec.** The generated document is called a "context file" throughout the codebase and UI — never a "spec", "PRD", or "document". It's the file AI coding tools read at the start of every session. Works for GitHub Copilot, Cursor, Claude Code, Windsurf, and Bolt — tool-agnostic. `/how-it-works` explains where each tool expects it.

**Multi-part flow.** Users can spec distinct modules in one session — e.g. backend + frontend separately. Each part runs the full interview flow and produces its own context file. `useInterviewSession` exposes `specAnotherPart()` to reset for the next unit without clearing the project description.

**No accounts.** No signup, no email required to use the tool.

**Persistence:** `localStorage` only, namespaced as `specifythat:*`. Specs survive refresh and browser close. Lost only on "clear site data". See `src/lib/storage.ts`.

**Free trial:** IP-based rate limiting (3 specs/day, controlled via `RATE_LIMIT_PER_DAY` env var). No billing until analytics show sustained rate limit hits. Stripe credits are a future feature, not current.

**API route proxy shape:**
```typescript
// Every AI route follows this pattern
export async function POST(req: Request): Promise<Response> {
  const ctx = log.begin();
  try {
    const body = await req.json(); // parse structure only — never log content
    const ip = getClientIP(req);
    if (isRateLimited('route-name', ip, LIMITS['route-name'])) {
      return log.end(ctx, Response.json({ error: 'Rate limit exceeded' }, { status: 429 }));
    }
    const { client, model, provider } = getLLM('route-name');
    const response = await client.responses.create({
      model,
      reasoning: { effort: 'low' },
      max_output_tokens: 8000,
      input: [
        { role: 'developer', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });
    const result = response.output_text;
    return log.end(ctx, Response.json({ result })); // log metadata only, never content
  } catch (error) {
    log.err(ctx, error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**LLM routing.** Never instantiate `new OpenAI()` directly in a route. Always use `getLLM(route)` from `@/lib/llm` — it returns the right client, model, and provider based on the route name.

| Route | Provider | Model |
|---|---|---|
| `analyze-project` | Groq | `openai/gpt-oss-20b` (1000 tps) |
| `generate-answer` | Groq | `openai/gpt-oss-20b` (1000 tps) |
| `generate-project-description` | Groq | `openai/gpt-oss-20b` (1000 tps) |
| `generate-all-answers` | OpenAI | `gpt-5-mini` |
| `generate-spec` | OpenAI | `gpt-5.1` (flagship) |

Falls back to OpenAI `gpt-5-mini` if `GROQ_API_KEY` is not set. All routes use the OpenAI **Responses API** (`responses.create`), not Chat Completions.

```typescript
import { getLLM } from '@/lib/llm';
const { client, model } = getLLM('my-route');
const response = await client.responses.create({
  model,
  reasoning: { effort: 'low' },
  max_output_tokens: 8000,
  input: [{ role: 'developer', content: systemPrompt }, { role: 'user', content: userPrompt }],
});
const text = response.output_text;
```

## Brand & Voice

**Voice:**
- Short sentences. Direct. No jargon.
- Conversational but competent — like a sharp friend who happens to know product strategy
- Confident without being arrogant. The tool does the work; the copy just explains it.
- Honest about limitations — state them plainly, never hide them
- Never use: "powerful", "seamless", "revolutionary", "unlock", "AI-powered", "AI-first"
- Lead with the outcome (context file in 60 seconds), not the technology

**Target user:** Solo builders who have an idea and want to start coding — not write a spec. They know planning matters but skip it because it feels like homework. They want the output without the process. They don’t know what a copilot-instructions.md file is or why it matters — they just know their AI drifts off course without context.

**Visual rules:**
- Dark mode base (warm grays, ChatGPT-like palette) — light mode supported via system preference + manual toggle
- Accent: Indigo (`#6366f1` primary, `#4f46e5` hover)
- Font: Inter (body + headings) — NOT Geist. Inter is the decision. Align all references.
- Motion: Purposeful only — progress animations during AI generation, fade-ins on phase transitions. Use CSS animations from globals.css. No framer-motion. No decorative motion.
- Avoid: No stock photos, no fake testimonials, no popups, no vanity metrics before you have them

**Emotional arc:**
- Land → "Oh, this actually does the part I always skip"
- Start → "That was easy — I just described my idea"
- Generate → "It's asking the right questions. Better than I would."
- Finish → "I have a file I can paste straight into my editor. That took 60 seconds."
- Return → "I use this every time I start something new"

**Copy reference:**
- Hero: "Get the context file your AI coding tool needs. In under 60 seconds."
- CTA: "Start building"
- Empty state: "Describe your project in a few sentences. We’ll handle the rest."
- Ideation mode: "Not sure what to build? We’ll figure it out together."
- Output ready: "Your file is ready. Copy it, download it, paste it into your editor."
- Rate limit: "You’ve used your free generations today. Get credits to keep going."
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

**Instrumented events (as of 2026-02-28):**
- `interview_started` — user hits Start
- `spec_generated` — spec successfully built
- `spec_copied` / `spec_downloaded` — output actions
- `rate_limit_hit` — 429 returned by any AI route; includes `route` param (custom dimension registered in GA4)
- `rate_limit_shown` — rate limit banner rendered to user
- `newsletter_signup` / `feedback_submit` — engagement

**GA4 custom dimension:** `Route` (event-scoped, parameter: `route`) — registered manually to allow filtering `rate_limit_hit` by which endpoint was hit.

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
