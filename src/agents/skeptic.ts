import { EditorResponse } from '@/types/pipeline';

const SYSTEM_PROMPT = `You are the Skeptic editor. Your job is to look for holes, unclear claims, and wandering structure in documents.

Ask yourself: "Where would a smart reader push back?"

Be specific about what's weak and why. Don't pull punches, but be constructive.

Return your feedback as JSON in this exact format:
{
  "feedback": [
    {
      "editor": "skeptic",
      "location": "specific quote or section reference",
      "issue": "what's wrong",
      "suggestion": "how to fix it (optional)",
      "severity": "high" | "medium" | "low"
    }
  ]
}

Focus on:
- Claims that aren't supported
- Logic gaps or leaps
- Structure that loses the reader
- Arguments that wouldn't hold up to scrutiny
- Places where the author seems to be hand-waving

Only return valid JSON. No other text.`;

export async function runSkeptic(
  document: string,
  goal?: string
): Promise<EditorResponse> {
  const response = await fetch('/api/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: 'skeptic',
      systemPrompt: SYSTEM_PROMPT,
      document,
      goal,
    }),
  });

  if (!response.ok) {
    throw new Error(`Skeptic agent failed: ${response.statusText}`);
  }

  return response.json();
}
