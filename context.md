# Project Context

## Product
SpecifyThat is an AI-powered spec generator that turns a raw project idea into a structured, build-ready spec in under 60 seconds. It runs a 13-question interview (mostly auto-answered by AI) and outputs a clean markdown spec ready to paste into any AI coding tool.

## Target User
Solo indie builders and developers who move fast and hate wasting time on planning documents. They have an idea and want a structured spec they can immediately hand to Cursor or Claude to start building — no ceremony, no templates, no thinking required.

## Stack Additions
- `@anthropic-ai/sdk` — `analyze-project` route (single vs. multi-unit detection)
- `openai` — `generate-answer`, `generate-spec`, `generate-project-description` routes (GPT-5-mini)
- `lucide-react` — icons throughout the UI

## Project Structure Additions
- `/hooks` → Custom React hooks (useInterviewSession state machine)
- `/docs` → Internal docs: project spec, roadmap, build log, brand guide

## Route Map
- `/` → Home — hero, tagline, CTA to start interview
- `/interview` → Main interview flow — 13-question spec generation wizard
- `/privacy` → Privacy policy
- `/terms` → Terms of service
