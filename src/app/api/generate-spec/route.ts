import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { GenerateSpecRequest } from '@/lib/types';
import { buildSpecFromAnswers } from '@/lib/specTemplate';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSpecRequest = await request.json();
    const { answers } = body;

    if (!answers || answers.length === 0) {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      );
    }

    // First, build the base spec from template
    const baseSpec = buildSpecFromAnswers(answers);

    // Then, use Claude to polish and enhance it
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

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    // Extract text from response
    const textContent = message.content.find(block => block.type === 'text');
    const spec = textContent ? textContent.text : baseSpec;

    return NextResponse.json({ spec });
  } catch (error) {
    console.error('Error generating spec:', error);
    
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your configuration.' },
          { status: 401 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate spec. Please try again.' },
      { status: 500 }
    );
  }
}
