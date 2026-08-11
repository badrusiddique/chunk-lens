import type { Chunk, SplitterOptions } from './types';
import { recursiveSplit } from './core';
import { PLAIN_TEXT_SEPARATORS } from './separators';

const HEADING_RE = /^#{1,6} /;

function findHeadingBoundaries(source: string): number[] {
  const boundaries = [0];
  let start = 0;

  let nlIdx = source.indexOf('\n', start);
  while (nlIdx !== -1) {
    const lineStart = nlIdx + 1;
    if (lineStart < source.length && HEADING_RE.test(source.slice(lineStart))) {
      boundaries.push(lineStart);
    }
    start = lineStart;
    nlIdx = source.indexOf('\n', start);
  }

  boundaries.push(source.length);
  return boundaries;
}

/** Split at ATX heading boundaries; oversized sections are further split by plain-text separators. */
export function splitMarkdownHeader(source: string, opts: SplitterOptions): readonly Chunk[] {
  if (source.length === 0) return [];

  const { chunkSize, chunkOverlap, measure } = opts;
  const boundaries = findHeadingBoundaries(source);
  const result: Chunk[] = [];

  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    if (start === undefined || end === undefined || end <= start) continue;

    if (measure(source.slice(start, end)) <= chunkSize) {
      result.push({ start, end });
    } else {
      result.push(
        ...recursiveSplit(
          source,
          { start, end },
          PLAIN_TEXT_SEPARATORS,
          measure,
          chunkSize,
          chunkOverlap,
        ),
      );
    }
  }

  return result;
}
