import OpenAI from 'openai';
import { AnalyzeProjectRequest, AnalysisResult } from '@/lib/types';
import { isGibberishInput } from '@/lib/sanitize';
import { createRouteLogger } from '@/lib/route-logger';
import { getClientIP, isRateLimited, LIMITS } from '@/lib/rate-limit';

const log = createRouteLogger('analyze-project');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeProjectTool: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'analyze_project',
    description:
      'Analyze a project description and determine if it is a single buildable unit or multiple buildable units.',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['single', 'multiple'],
          description: 'Whether this is a single buildable unit or multiple buildable units',
        },
        summary: {
          type: 'string',
          description:
            'For single units: A condensed 1-2 sentence description of what the project does and who it is for. Required when type is "single".',
        },
        units: {
          type: 'array',
          description:
            'For multiple units: An array of 3-6 distinct buildable units. Required when type is "multiple".',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Sequential ID starting from 1' },
              name: { type: 'string', description: 'Short name for the unit (3-6 words)' },
              description: {
                type: 'string',
                description: 'A 1-2 sentence description of this buildable unit',
              },
            },
            required: ['id', 'name', 'description'],
          },
        },
      },
      required: ['type'],
    },
  },
};

function buildAnalysisPrompt(userInput: string): string {
  return `You are analyzing a project description to determine if it's ONE buildable unit or MULTIPLE buildable units.

**Definitions:**

- **ONE buildable unit**: A project that can be shipped in 2-14 days by one developer. It has a single core feature or purpose. Examples:
  - A CLI tool that does one thing
  - A simple CRUD app with auth
  - A landing page with a contact form
  - A basic API with 3-5 endpoints

- **MULTIPLE buildable units**: A project description that contains several distinct systems or features that should be built sequentially. Examples:
  - "A SaaS with auth, billing, dashboards, and mobile apps"
  - "An e-commerce platform with inventory, payments, shipping, and analytics"
  - Any project where the user lists 3+ major features that could each be shipped independently

**Your Task:**

Analyze the following project description and use the analyze_project function to return your analysis.

<user_project_description>
${userInput}
</user_project_description>

**Instructions:**

1. Determine if this is ONE buildable unit or MULTIPLE.

2. If ONE buildable unit:
   - Condense the description to 1-2 clear sentences
   - Focus on: what it does, who it's for
   - Remove implementation details
   - Use the "summary" field

3. If MULTIPLE buildable units:
   - Extract 3-6 distinct buildable units
   - For each unit, provide:
     - A short name (3-6 words)
     - A 1-2 sentence description
   - Order them logically (what should be built first, second, etc.)
   - Focus on NATURAL breakpoints (not just arbitrary feature splits)
   - Use the "units" array

**Critical Rules:**
- If the description is short (under 200 chars) and mentions only 1-2 features, it's almost certainly SINGLE
- If the description lists 3+ distinct systems/features or uses words like "and", "also", "plus" to connect major features, consider MULTIPLE
- When in doubt, lean toward SINGLE (users can always add more detail)

Call the analyze_project function now with your analysis.`;
}

function isClearlySimple(input: string): boolean {
  return (
    input.length < 200 &&
    !input.toLowerCase().includes(' and ') &&
    input.split('.').filter((s) => s.trim()).length <= 2
  );
}

export async function POST(req: Request): Promise<Response> {
  const ctx = log.begin();

  try {
    const body: AnalyzeProjectRequest = await req.json();
    const { projectDescription, attachedDocContent } = body;

    // Validate input structure  never log content
    const hasDescription = Boolean(projectDescription?.trim());
    const hasDoc = Boolean(attachedDocContent?.trim());
    log.info(ctx.reqId, 'Request received', { hasDescription, hasDoc });

    const fullInput = [
      projectDescription || '',
      attachedDocContent ? `\n\n--- Attached Document ---\n${attachedDocContent}` : '',
    ]
      .join('')
      .trim();

    if (!fullInput) {
      return log.end(
        ctx,
        Response.json({ error: 'No project description provided' }, { status: 400 })
      );
    }

    // Block gibberish inputs before hitting OpenAI
    const userTypedText = (projectDescription || '').trim();
    if (userTypedText && !attachedDocContent && isGibberishInput(userTypedText)) {
      return log.end(
        ctx,
        Response.json(
          {
            error:
              'Please provide a meaningful project description. Your input appears to be random characters.',
          },
          { status: 400 }
        )
      );
    }

    // Rate limit check
    const ip = getClientIP(req);
    if (isRateLimited('analyze-project', ip, LIMITS['analyze-project'])) {
      log.warn(ctx.reqId, 'Rate limited', { ip });
      return log.end(
        ctx,
        Response.json({ error: 'Rate limit exceeded. Try again tomorrow.' }, { status: 429 })
      );
    }

    // Proxy: forward to OpenAI  no prompt content logged
    const message = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      max_tokens: 2000,
      tools: [analyzeProjectTool],
      tool_choice: { type: 'function', function: { name: 'analyze_project' } },
      messages: [{ role: 'user', content: buildAnalysisPrompt(fullInput) }],
    });

    const toolCall = message.choices[0].message.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('AI did not return structured analysis');
    }

    const result = JSON.parse(toolCall.function.arguments) as AnalysisResult;

    // Validate response shape
    if (result.type === 'single') {
      if (!result.summary || typeof result.summary !== 'string') {
        throw new Error('Invalid single unit response: missing summary');
      }
    } else if (result.type === 'multiple') {
      if (!('units' in result) || !Array.isArray(result.units) || result.units.length < 2) {
        throw new Error('Invalid multiple units response: missing or too few units');
      }
    } else {
      throw new Error('Invalid response type');
    }

    log.info(ctx.reqId, 'Analysis complete', { type: result.type });
    return log.end(ctx, Response.json({ result }));
  } catch (error) {
    // Smart fallback: if clearly simple, return description as-is rather than hard error
    let projectDescription = '';
    try {
      const body = await req.clone().json();
      projectDescription = body.projectDescription || '';
    } catch {
      // req body already consumed
    }

    if (isClearlySimple(projectDescription)) {
      log.warn(ctx.reqId, 'Using smart fallback for simple input');
      return log.end(
        ctx,
        Response.json({
          result: { type: 'single', summary: projectDescription.trim() } as AnalysisResult,
          fallback: true,
        })
      );
    }

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
      { error: "We couldn't analyze your project. Please try again or simplify your description." },
      { status: 500 }
    );
  }
}
