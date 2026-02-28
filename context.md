# Project Context

## Product
SpecifyThat is a context file generator for AI coding tools. A user
describes a vague project idea, the tool interviews them through 13
strategic questions (AI-generates most answers), and outputs a
`copilot-instructions.md` file — structured context that tells an AI
coding tool everything it needs to know about the project. Describe an
idea, get the file, paste it into your editor, start building. Under
60 seconds.

The output is NOT a traditional spec or PRD. It's the same file format
that professional developers use to give AI tools project context:
who the user is, what the product does, the stack, route map, data model,
build sequence. One file that makes every AI prompt smarter.

## Target User
Solo builders and small teams who have an idea but skip the planning step.
They jump straight into code, get stuck, and waste hours. They're not going
to write a spec voluntarily — but they'll answer a few questions if the tool
does the heavy lifting. Non-technical founders who need to hand a spec to a
developer or AI tool are a secondary audience.

## Stack Additions
- OpenAI SDK (`openai`) — LLM calls for analysis, answer generation, and spec polishing
- Zustand — client-side state management with localStorage persistence
- nanoid — ID generation for specs and sessions

Stack additions deferred until demand proves they're needed:
- Stripe — prepaid credit purchases (only add when users hit free trial rate limits)
- framer-motion — remove from current deps; reintroduce only if specific animations need it

## Project Structure Additions
```
/src/hooks              → useInterviewSession state machine
/src/stores             → Zustand stores (session, specs, preferences)
/src/lib/storage.ts     → Versioned localStorage wrapper (modeled on ProjectLoom)
/src/lib/questions.ts   → 13 hardcoded questions with AI context
/src/lib/sanitize.ts    → Gibberish detection, input validation
/src/lib/specTemplate.ts → Answer-to-copilot-instructions builder
/src/lib/types.ts       → All TypeScript interfaces
/docs                   → Brand guide, roadmap, build log
```

## Route Map
- `/`              → Landing page — hero, feature cards, CTA to start
- `/interview`     → Main interview flow (client component, state machine)
- `/specs`         → History — all saved context files with search, re-download, export/import
- `/privacy`       → Privacy policy
- `/terms`         → Terms of service

---

## Architecture: Local-First Rebuild

### Current state (v1)
All AI calls happen in Next.js API routes on the server. My server sees
every user prompt. No auth, no database, no persistence — everything
lives in React state and is lost on refresh. Email capture goes to
Google Forms. Feedback goes to FormSubmit.

### Target state (v2)
**Local-first proxy pattern.** API routes become thin proxies that:
1. Validate rate limits (free tier) or credits (paid tier, future)
2. Forward the request to OpenAI without logging prompt content
3. Return the response to the client

The server **handles** prompt data in transit but **never stores, logs,
or inspects** it. The honest claim: "Your prompts are never stored on
our servers." This is architecturally verifiable — no database, no log
calls, no analytics on prompt content.

**No accounts.** No username, password, or email required to use the tool.

**No prompt storage server-side.** My backend never logs, stores, or
inspects the content of user prompts.

### API route changes (proxy pattern)
Each API route follows this pattern:

```typescript
// Pseudocode — every AI route follows this structure
export async function POST(req: Request) {
  const ctx = log.begin();
  try {
    // 1. Parse request (body structure only — never log content)
    const body = await req.json();

    // 2. Rate limit check (IP-based for free tier)
    const ip = getClientIP(req);
    if (isRateLimited(ip)) {
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // 3. Forward to OpenAI — server acts as proxy
    const result = await openai.chat.completions.create({ ... });

    // 4. Return response — log success metadata only, never content
    return log.end(ctx, Response.json({ result }));
  } catch (error) {
    log.err(ctx, error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

| Route | v1 (current) | v2 (rebuild) |
|-------|-------------|-------------|
| `/api/analyze-project` | Server calls OpenAI, sees full prompt | Proxy: rate-limit → forward → return, no logging |
| `/api/generate-answer` | Server calls OpenAI, sees full prompt | Same proxy pattern |
| `/api/generate-spec` | Server calls OpenAI, sees full prompt | Same proxy pattern |
| `/api/generate-project-description` | Server calls OpenAI, sees full prompt | Same proxy pattern |
| `/api/send-feedback` | Forwards to FormSubmit | Keep as-is (user explicitly submits feedback) |

### Free trial (ship first)
- Rate-limited by IP address (e.g., 5 specs per day)
- Uses my API key (cost absorbed as customer acquisition cost)
- No signup required — just use the tool
- Clear upgrade prompt when limit hit: "You've used your free specs today."
- Track rate limit hits in analytics — this is the demand signal for billing

### Billing (ship later — only when data demands it)
**DECISION: Do not build billing until users hit rate limits and ask for more.**
Billing is 60% of the engineering effort and 0% of the user-facing value.
The signal to build billing: rate limit complaints in feedback or analytics
showing >20% of daily users hitting the cap consistently.

When the time comes:
- Stripe Checkout → one-time credit purchase
- Anonymous UUID generated at purchase, stored in localStorage
- Recovery code shown on purchase confirmation
- No PII attached to UUID
- Each API call deducts estimated token cost from balance

---

## Persistence: Local-First State Management

### Philosophy
A user with a database gets: saved specs, session resume, history, export.
A local-first user should get the same — stored on their device, not ours.

### Implementation (modeled on ProjectLoom's VersionedStorage pattern)

**Storage mechanism:** `localStorage` with a versioned wrapper class.
- Schema version tracking with migration pipelines
- Checksums on save, verification on load
- Namespaced keys: `specifythat:*`
- Graceful quota handling (toast warning, never silent data loss)

**What persists and when:**

| Data | Storage | Survives refresh | Survives tab close | Survives browser close | Survives clear site data |
|------|---------|------------------|--------------------|----------------------|------------------------|
| Current interview state | localStorage | Yes | Yes | Yes | No |
| Completed specs (history) | localStorage | Yes | Yes | Yes | No |
| User preferences | localStorage | Yes | Yes | Yes | No |
| Draft inputs | localStorage (debounced) | Yes | Yes | Yes | No |

**Storage keys:**
| Key | Purpose |
|-----|---------|
| `specifythat:session` | Active interview state (phase, answers, analysis result) |
| `specifythat:specs` | Array of completed specs with metadata (name, date, markdown) |
| `specifythat:preferences` | Theme, UI preferences |
| `specifythat:version` | Schema version for migrations |

**Key behaviors:**
- Interview state auto-saves on every answer (debounced 300ms)
- If user returns to `/interview` with a saved session, prompt: "Resume where you left off?" with option to start fresh
- Completed specs are saved permanently until user deletes them
- Spec history page (`/specs`) shows all saved specs with date, project name, and re-download option
- Export: download all specs as a single JSON backup file
- Import: restore from backup (overwrites, no merge)

**Why not sessionStorage:**
sessionStorage clears on tab close. A user who closes their laptop mid-interview and reopens it tomorrow should find their work intact. localStorage gives us this. The tradeoff (data lost on "clear site data") is acceptable — the export/backup feature mitigates it.

**Why not IndexedDB:**
Spec documents are small (5-20KB each). A user would need thousands of specs to approach the ~5MB localStorage quota. IndexedDB complexity isn't justified. If quota becomes an issue later, migrate then.

---

## Rebuild Sequence

Execute in this order. Each step is a shippable increment.

| Step | Issue | What | Why |
|------|-------|------|-----|
| 1 | #1 | Merge boilerplate structure | Foundation: `.github/`, `site.ts`, instructions, agents, prompts |
| 2 | #2 | Run `/init` with context.md + brand.md | Calibrate Copilot for the project |
| 3 | #3 | Refactor API routes to proxy pattern | Core architecture change — stop logging prompts |
| 4 | #4 | Add localStorage persistence | Session resume + spec history + export/import |
| 5 | #5 | Add IP-based rate limiting | Free trial protection |
| 6 | #6 | Cleanup: remove framer-motion, align fonts, update README | Reduce bundle, fix brand consistency |
| 7 | #7 | Deploy and verify | Ship it |
| 8 | — | Add Stripe credits (ONLY when rate limit data demands it) | Billing when there's demand, not before |

---

## Environment Variables
| Variable | Purpose | When |
|----------|---------|------|
| `OPENAI_API_KEY` | LLM calls (proxy, never exposed to client) | Now |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 tracking | Now |
| `NEXT_PUBLIC_BASE_URL` | OG image and metadata base URL | Now |
| `GMAIL_USER` | Feedback email notifications | Now |
| `GMAIL_APP_PASSWORD` | Gmail SMTP auth | Now |
| `STRIPE_SECRET_KEY` | Credit purchases | Later (when billing ships) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification | Later |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe checkout | Later |

## Key Metrics
- Specs generated per day (total + per unique IP)
- Spec completion rate (started interview → downloaded spec)
- Drop-off by question number
- Rate limit hits per day (demand signal for billing)
- Free trial → repeat user rate
- Average specs per returning user
