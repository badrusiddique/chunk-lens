import type { Chunk } from './splitters/types';

export interface ChunkStats {
  readonly inputChars: number;
  readonly emittedChars: number;
  readonly uniqueChars: number;
  readonly duplicatedChars: number;
}

export function computeStats(source: string, chunks: readonly Chunk[]): ChunkStats {
  const inputChars = source.length;

  if (chunks.length === 0) {
    return { inputChars, emittedChars: 0, uniqueChars: 0, duplicatedChars: 0 };
  }

  const emittedChars = chunks.reduce((sum, c) => sum + (c.end - c.start), 0);

  // Compute union length of all chunk ranges (sorted merge)
  const sorted = [...chunks].sort((a, b) => a.start - b.start);

  let uniqueChars = 0;
  let mergeStart: number | undefined;
  let mergeEnd: number | undefined;

  for (const c of sorted) {
    if (mergeStart === undefined || mergeEnd === undefined) {
      mergeStart = c.start;
      mergeEnd = c.end;
    } else if (c.start <= mergeEnd) {
      mergeEnd = Math.max(mergeEnd, c.end);
    } else {
      uniqueChars += mergeEnd - mergeStart;
      mergeStart = c.start;
      mergeEnd = c.end;
    }
  }
  if (mergeStart !== undefined && mergeEnd !== undefined) {
    uniqueChars += mergeEnd - mergeStart;
  }

  return {
    inputChars,
    emittedChars,
    uniqueChars,
    duplicatedChars: emittedChars - uniqueChars,
  };
}
