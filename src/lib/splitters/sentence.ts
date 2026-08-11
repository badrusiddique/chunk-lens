import type { Chunk, SplitterOptions } from './types';
import { mergeRanges } from './core';

const SENTENCE_SEG = new Intl.Segmenter(undefined, { granularity: 'sentence' });

/** Pack sentences greedily into chunks using Intl.Segmenter. */
export function splitSentence(source: string, opts: SplitterOptions): readonly Chunk[] {
  if (source.length === 0) return [];

  const sentences = Array.from(SENTENCE_SEG.segment(source), ({ index, segment }) => ({
    start: index,
    end: index + segment.length,
  }));

  return mergeRanges(source, sentences, opts.measure, opts.chunkSize, opts.chunkOverlap);
}
