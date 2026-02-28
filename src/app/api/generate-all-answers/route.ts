import OpenAI from 'openai';
import { questions } from '@/lib/questions';
import { createRouteLogger } from '@/lib/route-logger';
import { getClientIP, isRateLimited, LIMITS } from '@/lib/rate-limit';

const log = createRouteLogger('generate-all-answers');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? 'missing',
});

export async function POST(req: Request): Promise<Response> {
  const ctx = log.begin();

  try {
    const body = await req.json();
    const { projectDescription, projectSummary } = body;

    log.info(ctx.reqId, 'Request received', {
      hasDescription: Boolean(projectDescription),
      hasSummary: Boolean(projectSummary),
    });

    if (!projectDescription) {
      return log.end(ctx, Response.json({ error: 'projectDescription is required' }, { status: 400 }));
    }

    // Rate limit check
    const ip = getClientIP(req);
    if (isRateLimited('generate-all-answers', ip, LIMITS['generate-all-answers'])) {
      log.warn(ctx.reqId, 'Rate limited', { ip });
      return log.end(
        ctx,
        Response.json({ error: 'Rate limit exceeded. Try again tomorrow.' }, { status: 429 })
      );
    }

    const context = projectSummary || projectDescription;

    // Build a single prompt that answers all 13 questions.
    // Return JSON array so we can parse cleanly without regex.
    const questionsList = questions
      .map((q, i) => `${i + 1}. [${q.section}] ${q.text}\n   Context: ${q.contextForAI}`)
      .join('\n\n');

    const systemPrompt = `You are a senior product engineer helping a solo builder create context files for their AI coding tool.
Given the project description below, answer all 13 questions. Your answers will be assembled into a copilot-instructions.md file — structured context that AI coding assistants read to understand a project.

Be specific, practical, and opinionated. Write as if you're filling in a project brief that another engineer (or AI) needs to start building immediately.
Keep answers focused on what a solo developer can ship in 1-4 weeks.
Do not reference the project description verbatim — synthesize and improve on it.

For stack/constraint questions: recommend specific technologies, not categories.
For feature questions: use concrete, testable language ("Users can X" not "Support for X").
For data model questions: name real fields and types, not abstract descriptions.

Project description: ${context}

IMPORTANT: Respond ONLY with a valid JSON array of exactly 13 objects, one per question, in order.
Each object must have: { "questionId": number, "answer": string }
No extra text, no markdown fences, no comments — just the raw JSON array.`;

    const userPrompt = `Questions to answer:\n\n${questionsList}`;

    const completion = await openai.responses.create({
      model: 'gpt-5-mini',
      reasoning: { effort: 'low' },
      max_output_tokens: 20000,
      input: [
        { role: 'developer', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const raw = completion.output_text?.trim() ?? '[]';

    let parsed: Array<{ questionId: number; answer: string }>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      log.warn(ctx.reqId, 'JSON parse failed — retrying with cleanup');
      // Strip potential markdown fences and retry
      const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      parsed = JSON.parse(cleaned);
    }

    // Map back to Answer[] using the question text from our questions list
    const answers = questions.map((q, i) => {
      const match = parsed.find((p) => p.questionId === q.id) ?? parsed[i];
      return {
        question: q.text,
        answer: match?.answer?.trim() ?? '',
        isAIGenerated: true,
      };
    });

    return log.end(ctx, Response.json({ answers }), {
      answerCount: answers.length,
    });
  } catch (error) {
    log.err(ctx, error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
