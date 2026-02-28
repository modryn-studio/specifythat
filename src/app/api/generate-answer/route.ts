import OpenAI from 'openai';
import { GenerateAnswerRequest } from '@/lib/types';
import { questions } from '@/lib/questions';
import { isGibberishInput } from '@/lib/sanitize';
import { createRouteLogger } from '@/lib/route-logger';
import { getClientIP, isRateLimited, LIMITS } from '@/lib/rate-limit';

const log = createRouteLogger('generate-answer');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? 'missing',
});

export async function POST(req: Request): Promise<Response> {
  const ctx = log.begin();

  try {
    const body: GenerateAnswerRequest = await req.json();
    const { question, conversationContext, userInput } = body;

    // Validate structure  never log content
    log.info(ctx.reqId, 'Request received', {
      hasQuestion: Boolean(question),
      contextLength: conversationContext?.length ?? 0,
      hasUserInput: Boolean(userInput),
    });

    if (!question) {
      return log.end(ctx, Response.json({ error: 'Question is required' }, { status: 400 }));
    }

    // Block gibberish before hitting OpenAI
    if (userInput && isGibberishInput(userInput)) {
      return log.end(
        ctx,
        Response.json(
          {
            error:
              'Please provide a meaningful response. Your input appears to be random characters.',
          },
          { status: 400 }
        )
      );
    }

    // Rate limit check
    const ip = getClientIP(req);
    if (isRateLimited('generate-answer', ip, LIMITS['generate-answer'])) {
      log.warn(ctx.reqId, 'Rate limited', { ip });
      return log.end(
        ctx,
        Response.json({ error: 'Rate limit exceeded. Try again tomorrow.' }, { status: 429 })
      );
    }

    // Look up AI context for this question
    const questionConfig = questions.find((q) => q.text === question);
    const aiContext =
      questionConfig?.contextForAI || 'Provide a helpful answer based on best practices.';

    // Build conversation context summary
    let conversationSummary = '';
    if (conversationContext && conversationContext.length > 0) {
      conversationSummary = conversationContext
        .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
        .join('\n\n');
    }

    const systemPrompt = `You are an expert software architect and product strategist helping someone create a project specification. 
Your role is to provide "top 0.1% thinking" - the kind of answer that a world-class engineer or product manager would give.

Guidelines:
- Be specific and actionable, not vague
- Use concrete examples when helpful
- Keep answers concise but complete
- Format with bullet points or numbered lists when appropriate
- Think about what would actually work in practice, not just theory

${aiContext}`;

    const userPrompt = `The user is building a project spec and needs help answering this question.

${conversationSummary ? `Here's what they've already answered:\n\n${conversationSummary}\n\n---\n\n` : ''}

Current question: "${question}"

The user said: "${userInput}"

Provide a high-quality answer that they can use directly in their spec. Be specific and actionable.`;

    // Proxy: forward to OpenAI  no prompt content logged
    const message = await openai.responses.create({
      model: 'gpt-5-mini',
      reasoning: { effort: 'low' },
      max_output_tokens: 8000,
      input: [
        { role: 'developer', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const answer = message.output_text ?? 'Unable to generate answer.';

    return log.end(ctx, Response.json({ answer }));
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

    return Response.json({ error: 'Failed to generate answer. Please try again.' }, { status: 500 });
  }
}
