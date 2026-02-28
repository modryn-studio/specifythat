/**
 * LLM client factory — routes requests to the optimal provider.
 *
 * Groq for speed-critical, user-facing routes (analyze-project,
 * generate-answer, generate-project-description).
 * OpenAI for quality-critical routes (generate-all-answers, generate-spec).
 *
 * Falls back to OpenAI if GROQ_API_KEY is missing.
 */

import OpenAI from 'openai';

// ── Route config ─────────────────────────────────────

type LLMRoute =
  | 'analyze-project'
  | 'generate-answer'
  | 'generate-project-description'
  | 'generate-all-answers'
  | 'generate-spec';

type Provider = 'groq' | 'openai';

interface RouteConfig {
  provider: Provider;
  model: string;
}

const ROUTE_MAP: Record<LLMRoute, RouteConfig> = {
  'analyze-project':              { provider: 'groq',   model: 'openai/gpt-oss-20b' },
  'generate-answer':              { provider: 'groq',   model: 'openai/gpt-oss-20b' },
  'generate-project-description': { provider: 'groq',   model: 'openai/gpt-oss-20b' },
  'generate-all-answers':         { provider: 'openai', model: 'gpt-5-mini' },
  'generate-spec':                { provider: 'openai', model: 'gpt-5-mini' },
};

// ── Provider clients (lazy singletons) ───────────────

let _openai: OpenAI | null = null;
let _groq: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? 'missing',
    });
  }
  return _openai;
}

function getGroqClient(): OpenAI | null {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  if (!_groq) {
    _groq = new OpenAI({
      apiKey: key,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return _groq;
}

// ── Public API ───────────────────────────────────────

export interface LLMConfig {
  client: OpenAI;
  model: string;
  provider: Provider;
}

/**
 * Returns the LLM client, model, and provider for a route.
 * Falls back to OpenAI if Groq is configured but unavailable.
 */
export function getLLM(route: LLMRoute): LLMConfig {
  const config = ROUTE_MAP[route];

  if (config.provider === 'groq') {
    const groq = getGroqClient();
    if (groq) {
      return { client: groq, model: config.model, provider: 'groq' };
    }
    // Fallback: Groq key not set → use OpenAI
    return { client: getOpenAIClient(), model: 'gpt-5-mini', provider: 'openai' };
  }

  return { client: getOpenAIClient(), model: config.model, provider: 'openai' };
}
