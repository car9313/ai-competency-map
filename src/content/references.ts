/**
 * Referencias externas.
 *
 * `reviewedAt` no es decorativo: es lo que permite revisar y caducar una referencia
 * con criterio en lugar de confiar en que siga viva.
 */
import type { Reference } from '@/features/content/domain/types';

const REVIEWED = '2026-11-19';

export const REFERENCES: readonly Reference[] = [
  {
    id: 'ref-dl-book',
    title: 'Deep Learning — Goodfellow, Bengio, Courville',
    url: 'https://www.deeplearningbook.org/',
    reviewedAt: REVIEWED,
  },
  {
    id: 'ref-rules-ml',
    title: 'Rules of Machine Learning — Google',
    url: 'https://developers.google.com/machine-learning/guides/rules-of-ml',
    reviewedAt: REVIEWED,
  },
  {
    id: 'ref-attention',
    title: 'Attention Is All You Need — Vaswani et al.',
    url: 'https://arxiv.org/abs/1706.03762',
    reviewedAt: REVIEWED,
  },
  {
    id: 'ref-openai-tokens',
    title: 'What are tokens and how to count them — OpenAI',
    url: 'https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them',
    reviewedAt: REVIEWED,
  },
  {
    id: 'ref-anthropic-system',
    title: 'System prompts — Anthropic',
    url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/system-prompts',
    reviewedAt: REVIEWED,
  },
  {
    id: 'ref-isl',
    title: 'An Introduction to Statistical Learning — James et al.',
    url: 'https://www.statlearning.com/',
    reviewedAt: REVIEWED,
  },
];
