import { EditorFeedback, RevisionResponse } from '@/types/pipeline';

const SYSTEM_PROMPT = `You are the Revision agent. Your job is to incorporate accepted editor feedback into the document.

You will receive:
1. The original document
2. A list of accepted feedback items (each with location, issue, and optional suggestion)

Your task:
- Address each piece of feedback
- Make the minimum changes necessary to fix each issue
- Preserve the author's voice and intent
- Don't add new content beyond what's needed to address feedback

Return your revision as JSON in this exact format:
{
  "revisedDocument": "the full revised document text",
  "changesSummary": ["brief description of change 1", "brief description of change 2", ...]
}

Only return valid JSON. No other text.`;

export async function runRevision(
  document: string,
  acceptedFeedback: EditorFeedback[],
  goal?: string
): Promise<RevisionResponse> {
  const feedbackSummary = acceptedFeedback
    .map(
      (f, i) =>
        `${i + 1}. [${f.editor.toUpperCase()}] Location: "${f.location}"\n   Issue: ${f.issue}${f.suggestion ? `\n   Suggestion: ${f.suggestion}` : ''}${f.userEdit ? `\n   User note: ${f.userEdit}` : ''}`
    )
    .join('\n\n');

  const response = await fetch('/api/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: 'revision',
      systemPrompt: SYSTEM_PROMPT,
      document,
      goal,
      additionalContext: `ACCEPTED FEEDBACK TO ADDRESS:\n\n${feedbackSummary}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Revision agent failed: ${response.statusText}`);
  }

  return response.json();
}
