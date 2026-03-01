---
name: "Writing Style"
description: "Voice patterns, log post structure, and anti-patterns for all written content — log posts, social copy, and tool descriptions"
applyTo: "**/*.mdx"
---

# Luke Hanner — Writing Style Guide

## The Core Rule

State what happened. Explain why it matters. Let it stand.
No build-up. No wrap-up. No copy that sounds like a startup.

---

## Voice

**Do:**
- Short sentences. One clause when one will do.
- Declarative pairs: "It works. It's live."
- Contrast to make points land: "One sits in Notion. The other gets used."
- Personal admissions without apology: "I built this for me first."
- Honest about what's parked, blocked, or waiting for signal
- Present the logic, let the reader agree or not

**Don't:**
- "Powerful", "seamless", "revolutionary", "unlock", "game-changing"
- "I'm excited to announce" / "Today I'm launching"
- "In this post I'll explain..." — just start explaining
- Never summarize what you just wrote at the end
- No exclamation points
- Don't lead with tech — lead with outcome or tension

---

## Log Post Structure

### Opening (2–3 sentences max)
State the main thing directly. No preamble.
The second sentence adds the sharpest insight or the key tension.

> "The last update on SpecifyThat said it just needed to work again. It works. It's live."

> "The site is live. Not polished. Not finished. But it's up and it works."

### Body sections
Start each section with a direct statement, not a setup sentence.
Use `##` headings. Prefer: `## What shipped`, `## Why`, `## What's next`.
One idea per paragraph. Three sentences max per paragraph before you break it.

### The close (1–3 sentences)
No summary. No "follow along" fluff unless it's the right tone.
State where things stand, or name the next decision point, or both.

> "Right now it just needs to be used."

> "The issues are parked until then."

> "Follow along."

---

## Sentence Patterns (Use These)

**Declarative pair** — two short sentences that land as a unit:
> "It works. It's live."

**Contrast** — two things that look similar but aren't:
> "One sits in Notion. The other gets used."

**Signal-gated decision** — honest about what's not shipping yet:
> "None of those ship before there's signal."
> "The rate limit data will tell me when to add billing."

**Personal admission** — first-person, no apology:
> "I built this for me first. I skip the planning step too."

**Present state close** — where things actually stand right now:
> "Right now it just needs to be used."

---

## What a Log Post Is NOT

- Not a launch announcement. You're shipping in public, not announcing.
- Not a tutorial. Link to docs or code if needed; don't inline them.
- Not a recap. Assume the reader has been following along.
- Not marketing. If it sounds like a press release, cut it.

---

## Tone by Post Type

| Type | Tone |
|------|------|
| `launch` | Direct. State what shipped. Why it matters. What's parked. |
| `milestone` | Honest assessment. What the signal says. What changed. |
| `killed` | Blunt. What didn't work. What the signal was. One forward-looking line. |
| `learning` | First-person. The mistake or insight. The actual lesson, not the moral. |
| `build` | In-progress. What shipped today. What's next. No spin. |

---

## Frontmatter

```mdx
---
title: "Short, direct — no question marks, no hype"
date: "YYYY-MM-DD"
tag: "launch | milestone | killed | learning | build"
---
```

Title rules:
- Plain statement or short take — not a question, not a tease
- Lowercase after the colon is fine
- No year in the title (it's in the date)
- Max 10 words

---

## Social Copy (reference — full rules in `.github/prompts/social.prompt.md`)

The same voice applies to social copy. The social prompt has platform-specific formatting rules. When writing social copy:
- Pull the sharpest single take from the post — not a summary
- X hook = the tension or the outcome, one line
- Reddit body = state the situation, share your take, invite pushback
- shipordie.club = peer progress update, no selling
