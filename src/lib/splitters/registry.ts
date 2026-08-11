import type { Measure, SplitterMeta } from './types';
import { splitFixedWindow } from './fixed-window';
import {
  splitRecursiveJavaScript,
  splitRecursiveMarkdown,
  splitRecursivePython,
  splitRecursiveText,
} from './recursive';
import { splitSentence } from './sentence';
import { splitMarkdownHeader } from './markdown-header';
import { splitTokenWindow } from './token-window';

/** Phase 1 character-count measure (1 char = 1 unit). */
export const MEASURE_CHARS: Measure = (text) => text.length;

export const REGISTRY: readonly SplitterMeta[] = [
  {
    id: 'fixed-window',
    label: 'Fixed Window',
    description: 'Slices text at a fixed character count, snapping to grapheme boundaries.',
    langEquivalent: 'CharacterTextSplitter (LangChain)',
    defaultChunkSize: 25,
    defaultOverlap: 0,
    supportsOverlap: true,
    split: splitFixedWindow,
  },
  {
    id: 'recursive-text',
    label: 'Recursive Text',
    description: 'Recursively splits plain text by paragraph, line, space, then character.',
    langEquivalent: 'RecursiveCharacterTextSplitter (LangChain)',
    defaultChunkSize: 200,
    defaultOverlap: 50,
    supportsOverlap: true,
    split: splitRecursiveText,
  },
  {
    id: 'recursive-javascript',
    label: 'Recursive JS',
    description: 'Recursive splitter with JavaScript/TypeScript syntax-aware separators.',
    langEquivalent: 'RecursiveCharacterTextSplitter.fromLanguage("js") (LangChain)',
    defaultChunkSize: 200,
    defaultOverlap: 50,
    supportsOverlap: true,
    split: splitRecursiveJavaScript,
  },
  {
    id: 'recursive-python',
    label: 'Recursive Python',
    description: 'Recursive splitter with Python class/def-aware separators.',
    langEquivalent: 'RecursiveCharacterTextSplitter.fromLanguage("python") (LangChain)',
    defaultChunkSize: 200,
    defaultOverlap: 50,
    supportsOverlap: true,
    split: splitRecursivePython,
  },
  {
    id: 'recursive-markdown',
    label: 'Recursive Markdown',
    description: 'Recursive splitter with Markdown heading and code block separators.',
    langEquivalent: 'RecursiveCharacterTextSplitter.fromLanguage("markdown") (LangChain)',
    defaultChunkSize: 200,
    defaultOverlap: 50,
    supportsOverlap: true,
    split: splitRecursiveMarkdown,
  },
  {
    id: 'sentence',
    label: 'Sentence',
    description: 'Packs sentences greedily into chunks using Intl.Segmenter.',
    langEquivalent: 'SentenceTransformersTokenTextSplitter (LangChain)',
    defaultChunkSize: 400,
    defaultOverlap: 0,
    supportsOverlap: true,
    split: splitSentence,
  },
  {
    id: 'markdown-header',
    label: 'Markdown Header',
    description: 'Splits at ATX heading boundaries; oversized sections are further split.',
    langEquivalent: 'MarkdownHeaderTextSplitter (LangChain)',
    defaultChunkSize: 1000,
    defaultOverlap: 0,
    supportsOverlap: false,
    split: splitMarkdownHeader,
  },
  {
    id: 'token-window',
    label: 'Token Window',
    description: 'Fixed window in token space. Phase 1 uses character count; Phase 2 uses BPE.',
    langEquivalent: 'TokenTextSplitter (LangChain)',
    defaultChunkSize: 25,
    defaultOverlap: 0,
    supportsOverlap: true,
    split: splitTokenWindow,
  },
];

export function getSplitter(id: string): SplitterMeta | undefined {
  return REGISTRY.find((m) => m.id === id);
}
