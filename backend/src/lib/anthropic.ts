import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_BASE, sectionPrompt } from './prompts.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-6';

export interface GenerateInput {
  section:
    | 'executive_summary'
    | 'business_idea'
    | 'customers'
    | 'company'
    | 'finance'
    | 'appendix';
  answers: Record<string, unknown>;
  language: string;
  planContext?: Record<string, unknown>;
}

export async function generateSection(input: GenerateInput): Promise<string> {
  const userMsg = [
    `Zielsprache des Outputs: ${input.language}`,
    '',
    'Antworten des Nutzers (JSON):',
    JSON.stringify(input.answers, null, 2),
    input.planContext
      ? `\nBereits vorhandener Plan-Kontext (JSON):\n${JSON.stringify(input.planContext, null, 2)}`
      : '',
  ].join('\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: [
      {
        type: 'text',
        text: SYSTEM_BASE,
        cache_control: { type: 'ephemeral' },
      },
      {
        type: 'text',
        text: sectionPrompt(input.section),
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMsg }],
  });

  const out = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('\n\n');
  return out.trim();
}
