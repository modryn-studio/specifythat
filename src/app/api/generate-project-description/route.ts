import OpenAI from 'openai';
import { GenerateProjectDescriptionRequest, IdeationAnswers } from '@/lib/types';
import { isGibberishInput } from '@/lib/sanitize';
import { createRouteLogger } from '@/lib/route-logger';
import { getClientIP, isRateLimited, LIMITS } from '@/lib/rate-limit';

const log = createRouteLogger('generate-project-description');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? 'missing',
});

function buildIdeationPrompt(answers: IdeationAnswers): string {
  const parts: string[] = [];
  if (answers.problemFrustration) parts.push(`Problem/Frustration: ${answers.problemFrustration}`);
  if (answers.targetUser) parts.push(`Target User: ${answers.targetUser}`);
  if (answers.category) parts.push(`Category: ${answers.category}`);

  return `You are a product design expert helping someone crystallize their project idea into a clear description.

Based on the discovery answers below, generate a concise, clear project description suitable for a software specification document. Be creative and generous in your interpretation - even vague ideas can become software projects.

<discovery_answers>
${parts.join('\n')}
</discovery_answers>

Requirements:
1. Write 2-4 sentences that clearly describe what the project does and who it's for
2. Make reasonable assumptions to fill gaps and create a coherent software project concept
3. Focus on the core value proposition
4. Avoid jargon or buzzwords
5. Write in a direct, professional tone

Format: Just output the project description, no preamble or explanation.`;
}

export async function POST(req: Request): Promise<Response> {
  const ctx = log.begin();

  try {
    const body: GenerateProjectDescriptionRequest = await req.json();
    const { ideationAnswers } = body;

    // Validate structure  never log content
    log.info(ctx.reqId, 'Request received', {
      hasProblem: Boolean(ideationAnswers?.problemFrustration),
      hasUser: Boolean(ideationAnswers?.targetUser),
      hasCategory: Boolean(ideationAnswers?.category),
    });

    if (
      !ideationAnswers.problemFrustration &&
      !ideationAnswers.targetUser &&
      !ideationAnswers.category
    ) {
      return log.end(
        ctx,
        Response.json({ error: 'At least one discovery answer is required' }, { status: 400 })
      );
    }

    // Block gibberish before hitting OpenAI
    const inputs = [
      ideationAnswers.problemFrustration,
      ideationAnswers.targetUser,
      ideationAnswers.category,
    ].filter(Boolean);

    const allGibberish = inputs.every((input) => isGibberishInput(input || ''));
    if (allGibberish) {
      return log.end(
        ctx,
        Response.json(
          {
            error:
              'Please provide meaningful answers. The inputs appear to contain random characters.',
          },
          { status: 400 }
        )
      );
    }

    // Rate limit check
    const ip = getClientIP(req);
    if (isRateLimited('generate-project-description', ip, LIMITS['generate-project-description'])) {
      log.warn(ctx.reqId, 'Rate limited', { ip });
      return log.end(
        ctx,
        Response.json({ error: 'Rate limit exceeded. Try again tomorrow.' }, { status: 429 })
      );
    }

    // Proxy: forward to OpenAI  no prompt content logged
    const response = await openai.responses.create({
      model: 'gpt-5-mini',
      reasoning: { effort: 'low' },
      max_output_tokens: 8000,
      input: [{ role: 'user', content: buildIdeationPrompt(ideationAnswers) }],
    });

    const generatedText = response.output_text?.trim();

    if (!generatedText) {
      throw new Error('Empty response from OpenAI');
    }

    return log.end(ctx, Response.json({ projectDescription: generatedText }));
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

    return Response.json(
      { error: 'Failed to generate project description. Please try again.' },
      { status: 500 }
    );
  }
}
