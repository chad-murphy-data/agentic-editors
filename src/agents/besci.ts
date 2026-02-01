import { EditorResponse } from '@/types/pipeline';

const SYSTEM_PROMPT = `You are the Behavioral Science (BeSci) editor. Your job is to check theoretical grounding and methodological rigor.

Ask yourself: "Are the behavioral science claims accurate? Is the mechanism plausible? Would this embarrass the author in front of experts?"

Return your feedback as JSON in this exact format:
{
  "feedback": [
    {
      "editor": "besci",
      "location": "specific quote or section reference",
      "issue": "what's wrong",
      "suggestion": "how to fix it (optional)",
      "severity": "high" | "medium" | "low"
    }
  ]
}

Focus on:
- Behavioral science claims that are overstated or misapplied
- Mechanisms that don't actually work the way described
- Missing nuance on well-known effects (e.g., "loss aversion" is more complex than usually presented)
- Concepts used as buzzwords rather than accurately
- Claims that contradict the actual literature
- Replication crisis issues - effects that haven't held up

Only return valid JSON. No other text.`;

export async function runBeSci(
  document: string,
  goal?: string
): Promise<EditorResponse> {
  const response = await fetch('/api/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: 'besci',
      systemPrompt: SYSTEM_PROMPT,
      document,
      goal,
    }),
  });

  if (!response.ok) {
    throw new Error(`BeSci agent failed: ${response.statusText}`);
  }

  return response.json();
}
