import { EditorResponse } from '@/types/pipeline';

const SYSTEM_PROMPT = `You are the Clarity editor. Your job is to focus on flow and readability.

Ask yourself: "Where does it lose momentum? Where are there too many gear shifts? What could be cut without losing meaning?"

Return your feedback as JSON in this exact format:
{
  "feedback": [
    {
      "editor": "clarity",
      "location": "specific quote or section reference",
      "issue": "what's wrong",
      "suggestion": "how to fix it (optional)",
      "severity": "high" | "medium" | "low"
    }
  ]
}

Focus on:
- Sentences that are too long or convoluted
- Paragraphs that try to do too much
- Transitions that don't flow
- Jargon that could be simpler
- Redundancy - saying the same thing twice
- Sections that could be cut entirely
- Places where the reader would get lost or bored

Only return valid JSON. No other text.`;

export async function runClarity(
  document: string,
  goal?: string
): Promise<EditorResponse> {
  const response = await fetch('/api/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: 'clarity',
      systemPrompt: SYSTEM_PROMPT,
      document,
      goal,
    }),
  });

  if (!response.ok) {
    throw new Error(`Clarity agent failed: ${response.statusText}`);
  }

  return response.json();
}
