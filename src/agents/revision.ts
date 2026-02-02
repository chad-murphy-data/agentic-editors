import { EditorFeedback, RevisionResponse } from '@/types/pipeline';

const SYSTEM_PROMPT = `You are the Revision agent. Your job is to incorporate accepted editor feedback into the document.

You will receive:
1. The original document
2. A list of feedback items with their status and any author responses

Your task:
- Address each piece of feedback appropriately
- When the author has provided a RESPONSE to feedback, treat it as crucial context:
  - The author may be pushing back - consider whether their point is valid
  - The author may be providing context that makes the feedback less relevant
  - The author may be partially agreeing - incorporate what makes sense
  - Use your judgment to balance editor feedback with author intent
- Make the minimum changes necessary
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
        `${i + 1}. [${f.editor.toUpperCase()}] Location: "${f.location}"
   Issue: ${f.issue}${f.suggestion ? `\n   Suggestion: ${f.suggestion}` : ''}${f.userEdit ? `\n   User edit: ${f.userEdit}` : ''}${f.userResponse ? `\n   AUTHOR'S RESPONSE: "${f.userResponse}" (Consider this context when deciding how to address this feedback)` : ''}`
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
