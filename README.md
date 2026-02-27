![SpecifyThat](public/brand/banner.png)

# SpecifyThat

Turn a vague idea into a build-ready spec in under 60 seconds. Answer a few questions — AI handles the rest. No account required.

→ [specifythat.com](https://specifythat.com)

---

## Local setup

```bash
git clone https://github.com/modryn-studio/specifythat.git
cd specifythat
npm install
cp .env.example .env.local
npm run dev
```

### Env vars

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | gpt-5-mini access |
| `RATE_LIMIT_PER_DAY` | | Specs per IP per day. Default: `5` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | | GA4 Measurement ID |
| `RESEND_API_KEY` | | Feedback emails (optional) |

---

## Stack

Next.js 16 · TypeScript · Tailwind CSS v4 · OpenAI gpt-5-mini · Zustand · Vercel
