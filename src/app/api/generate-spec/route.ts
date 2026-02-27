import OpenAI from 'openai';
import { GenerateSpecRequest } from '@/lib/types';
import { buildSpecFromAnswers } from '@/lib/specTemplate';
import { createRouteLogger } from '@/lib/route-logger';
import { getClientIP, isRateLimited, LIMITS } from '@/lib/rate-limit';

const log = createRouteLogger('generate-spec');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? 'missing',
});

export async function POST(req: Request): Promise<Response> {
  const ctx = log.begin();

  try {
    const body: GenerateSpecRequest = await req.json();
    const { answers } = body;

    log.info(ctx.reqId, 'Request received', { answerCount: answers?.length ?? 0 });

    if (!answers || answers.length === 0) {
      return log.end(ctx, Response.json({ error: 'Answers are required' }, { status: 400 }));
    }

    // Rate limit check  hard cap, this is the terminal step
    const ip = getClientIP(req);
    if (isRateLimited('generate-spec', ip, LIMITS['generate-spec'])) {
      log.warn(ctx.reqId, 'Rate limited', { ip });
      return log.end(
        ctx,
        Response.json(
          { error: "You've used your free specs today. Get credits to keep going." },
          { status: 429 }
        )
      );
    }

    // Build base spec from template  no content logged
    const baseSpec = buildSpecFromAnswers(answers);

    const systemPrompt = `You are an expert at writing clear, actionable project specifications.
Your task is to take a draft project spec and polish it into a clean, professional document.

Guidelines:
- Keep the same structure and sections
- Fix any grammar or formatting issues
- Make sure requirements are specific and testable
- Ensure constraints are clear and non-negotiable
- Add any obvious missing details based on context
- Keep the tone direct and execution-focused
- Do NOT add new sections
- Do NOT make the spec longer than necessary
- Output valid markdown`;

    const userPrompt = `Here's a draft project spec. Polish it into a clean, professional document while keeping the same structure:

${baseSpec}

Return the polished spec in markdown format. Keep it concise and actionable.`;

    // Proxy: forward to OpenAI  no prompt content logged
    const message = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    // Fall back to unpolished base spec if OpenAI returns nothing
    const spec = message.choices[0].message.content ?? baseSpec;

    return log.end(ctx, Response.json({ spec }));
  } catch (error) {
    log.err(ctx, error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return Response.json({ error: 'Invalid API key.' }, { status: 401 });
      }
      if (error.status === 429) {
        return Response.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }
    }

    return Response.json({ error: 'Failed to generate spec. Please try again.' }, { status: 500 });
  }
}
