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

function buildUserMessage(input: GenerateInput): string {
  return [
    `Zielsprache des Outputs: ${input.language}`,
    '',
    'Antworten des Nutzers (JSON):',
    JSON.stringify(input.answers, null, 2),
    input.planContext
      ? `\nBereits vorhandener Plan-Kontext (JSON):\n${JSON.stringify(input.planContext, null, 2)}`
      : '',
  ].join('\n');
}

function buildSystem(input: GenerateInput) {
  return [
    { type: 'text' as const, text: SYSTEM_BASE, cache_control: { type: 'ephemeral' as const } },
    { type: 'text' as const, text: sectionPrompt(input.section), cache_control: { type: 'ephemeral' as const } },
  ];
}

export async function generateSection(input: GenerateInput): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: buildSystem(input),
    messages: [{ role: 'user', content: buildUserMessage(input) }],
  });

  const out = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('\n\n');
  return out.trim();
}

/**
 * Streaming variant — yields text deltas as they arrive.
 * Caller iterates and pipes each chunk to the client (SSE).
 */
export async function* generateSectionStream(input: GenerateInput): AsyncGenerator<string> {
  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    system: buildSystem(input),
    messages: [{ role: 'user', content: buildUserMessage(input) }],
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}
