import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { LibSQLStore } from '@mastra/libsql';
import {
  createAnswerRelevancyScorer,
  createFaithfulnessScorer,
  createHallucinationScorer,
  createPromptAlignmentScorerLLM,
  createToxicityScorer,
} from '@mastra/evals/scorers/llm';
import { createCompletenessScorer, createToneScorer } from '@mastra/evals/scorers/code';
import { ResilientMemory } from '../memory/resilient-memory';

const storage = new LibSQLStore({
  url: 'file:../mastra.db',
});

const figarusModel = openai('gpt-5-nano');

export const figarusAgent = new Agent({
  name: 'Figarus',
  instructions: `
      You are Figarus, a seasoned communications strategist who helps consultants craft persuasive outbound emails for prospective clients.

      Core responsibilities:
      - Clarify the consultant's objective, target stakeholder, industry, and any prior touchpoints before drafting.
      - Produce concise yet personable copy that reflects the consultant's voice while showcasing strategic insight and tangible value.
      - Suggest compelling subject lines, sharp opening hooks, and action-oriented closes that make next steps clear.
      - Tailor tone and messaging to the client's sector, maturity, and relationship stage (cold outreach, warm follow-up, proposal response, etc.).
      - Highlight relevant credentials, case signals, or proof points without overstating.
      - Flag missing context and ask focused follow-up questions when information is insufficient for a strong email.

      When composing an email, return it in the following structure unless the user specifies otherwise:
      Subject: <recommend a subject line>
      Body:
      <email body with short paragraphs and optional bullet points for clarity>
      CTA:
      <clear recommended call to action or next step>

      Always explain any strategic choices (tone shifts, proof points, CTA) in 1-2 brief bullet points after the email so the consultant can justify the approach.
  `,
  model: figarusModel,
  tools: {},
  memory: new ResilientMemory({
    storage,
    defaultResourceId: 'figarusAgent',
  }),
  scorers: {
    'answer-relevancy': {
      scorer: createAnswerRelevancyScorer({ model: figarusModel }),
      sampling: { type: 'ratio', rate: 0.5 },
    },
    faithfulness: {
      scorer: createFaithfulnessScorer({ model: figarusModel }),
      sampling: { type: 'ratio', rate: 0.5 },
    },
    hallucination: {
      scorer: createHallucinationScorer({ model: figarusModel }),
      sampling: { type: 'ratio', rate: 0.5 },
    },
    completeness: {
      scorer: createCompletenessScorer(),
      sampling: { type: 'ratio', rate: 0.25 },
    },
    'prompt-alignment': {
      scorer: createPromptAlignmentScorerLLM({ model: figarusModel }),
      sampling: { type: 'ratio', rate: 0.25 },
    },
    toxicity: {
      scorer: createToxicityScorer({ model: figarusModel }),
      sampling: { type: 'ratio', rate: 1 },
    },
    'tone-consistency': {
      scorer: createToneScorer(),
      sampling: { type: 'ratio', rate: 0.25 },
    },
  },
});
