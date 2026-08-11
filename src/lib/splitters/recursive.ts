import type { Chunk, SplitterOptions } from './types';
import { recursiveSplit } from './core';
import {
  JAVASCRIPT_SEPARATORS,
  MARKDOWN_SEPARATORS,
  PLAIN_TEXT_SEPARATORS,
  PYTHON_SEPARATORS,
} from './separators';

function makeRecursiveSplitter(separators: readonly string[]) {
  return function split(source: string, opts: SplitterOptions): readonly Chunk[] {
    if (source.length === 0) return [];
    return recursiveSplit(
      source,
      { start: 0, end: source.length },
      separators,
      opts.measure,
      opts.chunkSize,
      opts.chunkOverlap,
    );
  };
}

export const splitRecursiveText = makeRecursiveSplitter(PLAIN_TEXT_SEPARATORS);
export const splitRecursiveJavaScript = makeRecursiveSplitter(JAVASCRIPT_SEPARATORS);
export const splitRecursivePython = makeRecursiveSplitter(PYTHON_SEPARATORS);
export const splitRecursiveMarkdown = makeRecursiveSplitter(MARKDOWN_SEPARATORS);
