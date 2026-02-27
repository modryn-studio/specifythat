# SpecifyThat

Turn a vague idea into a build-ready spec in under 60 seconds.

SpecifyThat runs a short interview, auto-generates most answers with AI, and outputs a structured markdown spec ready to paste into any AI coding assistant. Built for solo builders and small teams who skip the planning step, get stuck, and need the output without the process.

---

## How it works

1. Describe your project in a few sentences
2. SpecifyThat asks up to 13 targeted questions — and suggests answers AI already knows
3. You get a complete spec. Copy it, download it, paste it into your AI tool.

Your prompts are never stored on our servers.

---

## Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 — dark mode, CSS custom properties
- **AI**: OpenAI (`gpt-4o-mini`) via thin server-side proxy routes
- **State**: Zustand with manual localStorage persistence (no accounts required)
- **ID generation**: nanoid
- **Analytics**: Vercel Analytics (pageviews) + GA4 (custom events)
- **Icons**: lucide-react
- **Deployment**: Vercel

## Architecture

**Local-first.** All spec history is stored in your browser's localStorage. No database, no account, no sync. Your specs survive refresh and browser close — lost only on "clear site data."

**Privacy by design.** API routes are thin proxies: validate → forward to OpenAI → return response. The server never logs, stores, or inspects prompt content.

**No accounts.** No signup, no email required to use the tool.

**Free trial.** IP-based rate limiting (default: 5 specs/day). Configured via `RATE_LIMIT_PER_DAY` env var.

---

## Local setup

```bash
git clone https://github.com/modryn-studio/specifythat.git
cd specifythat
npm install
cp .env.example .env.local   # then fill in your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | OpenAI API key with access to gpt-4o-mini |
| `RATE_LIMIT_PER_DAY` | | Free trial cap per IP per day. Default: `5` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | | Google Analytics 4 Measurement ID |
| `RESEND_API_KEY` | | Resend API key for feedback emails (optional) |
| `GMAIL_USER` | | Gmail address for feedback fallback (optional) |
| `GMAIL_APP_PASSWORD` | | Gmail app password for feedback fallback (optional) |
| `FEEDBACK_TO` | | Email address to receive feedback (optional, defaults to `GMAIL_USER`) |

---

## Project structure

```
src/
  app/            # Next.js App Router pages + API routes
    api/          # Thin OpenAI proxy routes (analyze-project, generate-answer, generate-spec, generate-project-description, feedback)
    interview/    # Main interview flow
    specs/        # Spec history
  components/     # Reusable UI components
  hooks/          # useInterviewSession state machine
  lib/            # Utilities: questions, sanitize, specTemplate, storage, rate-limit, analytics
  stores/         # Zustand stores (session, specs)
  types/          # TypeScript interfaces
```

---

## Scripts

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npm run lint      # ESLint
```

---

## Contributing

This is a solo project by [Luke Hanner](https://lukehanner.com). Issues and PRs welcome.

---

## Privacy

SpecifyThat is local-first. Your answers and generated specs are stored only in your browser. When you use the AI features, your input is forwarded to OpenAI — it is not retained on SpecifyThat's servers. See the [privacy policy](https://specifythat.com/privacy) for details.
