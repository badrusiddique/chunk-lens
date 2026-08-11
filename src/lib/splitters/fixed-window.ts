import type { Chunk, SplitterOptions } from './types';
import { snapGraphemeBoundary } from './core';

/** Fixed-size character window with grapheme-cluster boundary snapping. */
export function splitFixedWindow(source: string, opts: SplitterOptions): readonly Chunk[] {
  const { chunkSize, chunkOverlap } = opts;
  if (source.length === 0 || chunkSize <= 0) return [];

  const effectiveOverlap = Math.min(chunkOverlap, chunkSize - 1);
  const stride = Math.max(1, chunkSize - effectiveOverlap);
  const chunks: Chunk[] = [];
  let pos = 0;

  while (pos < source.length) {
    const rawEnd = pos + chunkSize;
    const end = rawEnd >= source.length ? source.length : snapGraphemeBoundary(source, rawEnd);
    const safeEnd = end > pos ? end : Math.min(pos + 1, source.length);

    chunks.push({ start: pos, end: safeEnd });

    if (safeEnd >= source.length) break;

    const rawNext = pos + stride;
    const nextPos =
      rawNext >= source.length ? source.length : snapGraphemeBoundary(source, rawNext);
    pos = nextPos > pos ? nextPos : pos + 1;
  }

  return chunks;
}
