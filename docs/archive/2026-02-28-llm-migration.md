# SpecifyThat — Build Log

> **Archived.** This is a one-time migration record, not a living document. Ongoing changes are logged at [modrynstudio.com/log](https://modrynstudio.com/log).

---

## 2026-02-28 — LLM Migration: Claude Sonnet 4.5 → GPT-5 mini (+ API overhaul)

### Context

All five AI API routes were originally written targeting **Claude Sonnet 4.5** via the **Anthropic Messages API** (`POST /v1/messages`). At some point the project was switched to use the **OpenAI `openai` SDK** and the model was updated to **`gpt-5-mini`**, but the route code was not updated to match how GPT-5 mini actually works. This caused a cascade of bugs discovered on 2026-02-28.

---

### Bug 1 — `max_tokens` not supported

**Error:**
```
Error: 400 Unsupported parameter: 'max_tokens' is not supported with this model. Use 'max_completion_tokens' instead.
```

**Cause:** Newer OpenAI models (GPT-5 family) dropped `max_tokens` in favour of `max_completion_tokens`. The routes were still using `max_tokens`.

**Fix:** Replaced `max_tokens` with `max_completion_tokens` in all 5 routes:
- `analyze-project`
- `generate-all-answers`
- `generate-answer`
- `generate-spec`
- `generate-project-description`

---

### Bug 2 — Empty response from OpenAI (the deeper problem)

**Error (after Bug 1 fix):**
```
Error: Empty response from OpenAI
POST /api/generate-project-description 500 in 6.6s
```
The request took 6.4 seconds, meaning OpenAI processed it, but `choices[0].message.content` was empty.

**Root cause:** `gpt-5-mini` is a **reasoning model** — it internally generates "reasoning tokens" before producing visible output. When `max_completion_tokens` was set to a small value (e.g. 500), the entire token budget was consumed by reasoning, leaving zero tokens for the actual visible response. OpenAI's SDK returned success with empty `content`.

OpenAI's documentation states that reasoning models should use `max_output_tokens` with at least **25,000 tokens reserved** for reasoning + output combined, and recommends using the **Responses API** (`POST /v1/responses`) instead of Chat Completions for reasoning models.

> "Reasoning models work better with the Responses API. While the Chat Completions API is still supported, you'll get improved model intelligence and performance by using Responses." — OpenAI Docs

---

### Migration: Chat Completions → Responses API

All 5 routes were migrated from `openai.chat.completions.create()` to `openai.responses.create()`.

#### Key API differences

| Concern | Chat Completions | Responses API |
|---|---|---|
| Method | `openai.chat.completions.create()` | `openai.responses.create()` |
| Input param | `messages: [...]` | `input: [...]` |
| System role | `{ role: 'system', content: '...' }` | `{ role: 'developer', content: '...' }` |
| Token limit param | `max_completion_tokens` | `max_output_tokens` |
| Output access | `choices[0].message.content` | `response.output_text` (SDK helper) |
| Tool definition shape | `{ type: 'function', function: { name, description, parameters } }` | `{ type: 'function', name, description, parameters, strict }` |
| Tool choice | `{ type: 'function', function: { name: '...' } }` | `{ type: 'function', name: '...' }` |
| Tool result access | `choices[0].message.tool_calls[0].function.arguments` | `output.find(item => item.type === 'function_call').arguments` |
| Reasoning control | Not supported | `reasoning: { effort: 'low' \| 'medium' \| 'high' }` |
| Function strictness | Non-strict by default | Strict by default (requires `strict: false` to disable) |

#### Token budgets applied

| Route | Provider | Model | `max_output_tokens` | Reasoning effort |
|---|---|---|---|---|
| `generate-project-description` | Groq | `openai/gpt-oss-20b` | 8,000 | `low` |
| `analyze-project` | Groq | `openai/gpt-oss-20b` | 10,000 | `low` |
| `generate-answer` | Groq | `openai/gpt-oss-20b` | 8,000 | `low` |
| `generate-all-answers` | OpenAI | `gpt-5-mini` | 20,000 | `low` |
| `generate-spec` | OpenAI | `gpt-5.1` | 25,000 | `low` |

All set to `effort: 'low'` — suitable for well-defined, short-output tasks on a fast path. `generate-spec` was upgraded from `gpt-5-mini` → `gpt-5.1` on 2026-03-04 (current OpenAI flagship, same price as `gpt-5`).

---

### How to revert to Claude (Anthropic Messages API)

If switching back to Claude (e.g. `claude-sonnet-4-5` or any Claude model), the following changes are required per route:

#### 1. SDK & client

```ts
// Remove:
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? 'missing' });

// Add:
import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? 'missing' });
```

#### 2. Simple text generation (no tools)

```ts
// OpenAI Responses API (current):
const response = await openai.responses.create({
  model: 'gpt-5-mini',
  reasoning: { effort: 'low' },
  max_output_tokens: 8000,
  input: [
    { role: 'developer', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ],
});
const text = response.output_text;

// Claude Messages API equivalent:
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 2000,           // Claude uses max_tokens (output only, no reasoning budget needed)
  system: systemPrompt,       // system is a top-level param, not a message role
  messages: [
    { role: 'user', content: userPrompt },
  ],
});
const text = response.content[0].type === 'text' ? response.content[0].text : '';
```

Key differences:
- Claude does **not** have a reasoning token budget — `max_tokens` is purely output tokens.
- `system` prompt is a **top-level parameter**, not a message with `role: 'system'`.
- Response text is at `content[0].text`, not `output_text`.
- No `reasoning` parameter exists on Claude.

#### 3. Tool use (function calling)

```ts
// OpenAI Responses API (current):
const response = await openai.responses.create({
  model: 'gpt-5-mini',
  tools: [{
    type: 'function',
    name: 'my_tool',
    strict: false,
    description: '...',
    parameters: { ... },
  }],
  tool_choice: { type: 'function', name: 'my_tool' },
  input: [{ role: 'user', content: prompt }],
});
const toolCall = response.output.find(item => item.type === 'function_call');
const args = JSON.parse(toolCall.arguments);

// Claude Messages API equivalent:
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 2000,
  tools: [{
    name: 'my_tool',
    description: '...',
    input_schema: { type: 'object', properties: { ... }, required: [...] },
    // Note: 'parameters' → 'input_schema' in Claude
  }],
  tool_choice: { type: 'tool', name: 'my_tool' },
  messages: [{ role: 'user', content: prompt }],
});
const toolUse = response.content.find(block => block.type === 'tool_use');
const args = toolUse.input; // already parsed object, not a JSON string
```

Key differences for tools:
- Claude uses `input_schema` instead of `parameters`.
- `tool_choice` shape differs: `{ type: 'tool', name: '...' }` (not `{ type: 'function', name: '...' }`).
- Tool result is `toolUse.input` (already a parsed object), not `JSON.parse(toolCall.arguments)`.

#### 4. Error handling

Claude errors extend `Anthropic.APIError` and include a `status` field — same pattern as the current OpenAI error handling. The existing `error instanceof OpenAI.APIError` checks become `error instanceof Anthropic.APIError`.

#### 5. Environment variable

```
# .env.local
ANTHROPIC_API_KEY=sk-ant-...   # instead of OPENAI_API_KEY
```

---

### Files changed in this session

| File | Change |
|---|---|
| `src/app/api/generate-project-description/route.ts` | `chat.completions` → `responses.create`, `max_tokens` → `max_output_tokens: 8000`, added `reasoning: { effort: 'low' }`. Routed to Groq (`openai/gpt-oss-20b`). |
| `src/app/api/analyze-project/route.ts` | Same migration. Tool type updated from `ChatCompletionTool` → `FunctionTool` (flat structure, added `strict: false`). Tool result parsed from `output` array instead of `tool_calls`. Routed to Groq (`openai/gpt-oss-20b`). |
| `src/app/api/generate-all-answers/route.ts` | Same migration. Model upgraded from `gpt-4o-mini` → `gpt-5-mini`. Removed `temperature` (not supported on reasoning models). |
| `src/app/api/generate-answer/route.ts` | Same migration. Routed to Groq (`openai/gpt-oss-20b`). |
| `src/app/api/generate-spec/route.ts` | Same migration. Upgraded to `gpt-5.1` on 2026-03-04 (current OpenAI flagship). |

---

### Why reasoning token exhaustion is silent

When `max_output_tokens` is too low, OpenAI's reasoning model spends its entire budget thinking and returns a response object with `status: 'incomplete'` and empty `output_text` — it does **not** throw an HTTP error. This makes the bug look like an "empty response" application error rather than a configuration error. Always set generous `max_output_tokens` on reasoning model routes (25,000+ for complex tasks, 8,000+ for simple ones).
