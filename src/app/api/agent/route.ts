import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(request: NextRequest) {
  try {
    const { agent, systemPrompt, document, goal, additionalContext } =
      await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Construct the user message
    let userMessage = `DOCUMENT:\n\n${document}`;

    if (goal) {
      userMessage = `GOAL: ${goal}\n\n${userMessage}`;
    }

    if (additionalContext) {
      userMessage = `${userMessage}\n\n${additionalContext}`;
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Anthropic API error for ${agent}:`, errorText);
      return NextResponse.json(
        { error: `API call failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract the text content from Claude's response
    const textContent = data.content.find(
      (block: { type: string }) => block.type === 'text'
    );

    if (!textContent) {
      return NextResponse.json(
        { error: 'No text content in response' },
        { status: 500 }
      );
    }

    // Parse the JSON response from Claude
    try {
      const parsed = JSON.parse(textContent.text);
      return NextResponse.json(parsed);
    } catch {
      // If Claude didn't return valid JSON, try to extract it
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      }
      console.error(`Failed to parse JSON from ${agent}:`, textContent.text);
      return NextResponse.json(
        { error: 'Failed to parse agent response as JSON' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
