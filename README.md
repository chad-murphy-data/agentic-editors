# Document Refinement Pipeline

AI-powered document editing through a pipeline of independent agents. Each agent operates in a fresh context (separate API call), providing genuinely independent feedback rather than "yes, and..." responses.

## How It Works

1. **Paste your document** - Add any document and optionally specify a goal
2. **Editors review** - Three independent editors (Skeptic, BeSci, Clarity) critique in parallel
3. **You decide** - Accept, reject, or edit each piece of feedback
4. **Document revises** - Changes are applied, then a Voice Pass makes it sound like you
5. **Buyers react** - Four buyer personas (CEO, CPO, CRO, Head CX) read cold and respond
6. **Loop or done** - Start another round or let it cook autonomously

## Agents

### Editors (run in parallel)
- **Skeptic**: Looks for holes, unclear claims, wandering structure
- **BeSci**: Checks behavioral science accuracy and theoretical grounding
- **Clarity**: Focuses on flow, readability, and what can be cut

### Buyers (run in parallel)
- **CEO**: Strategic lens - "Does this change how we compete?"
- **CPO**: Product lens - "Can I use this? What's the lift to adopt?"
- **CRO**: Research lens - "Is this rigorous? Will it hold up?"
- **Head of CX**: Practical lens - "Does this solve a problem we actually have?"

## Setup

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your Anthropic API key:
   ```bash
   # Create .env.local
   ANTHROPIC_API_KEY=your_key_here
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

## Deployment

For Vercel/GitHub deployment, add `ANTHROPIC_API_KEY` as an environment variable/secret.

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- Claude API (Sonnet 4)
