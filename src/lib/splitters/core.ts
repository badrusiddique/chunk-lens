import type { Chunk, Measure } from './types';

const GRAPHEME_SEG = new Intl.Segmenter();

interface Range {
  readonly start: number;
  readonly end: number;
}

/** Snap `pos` inward to the nearest grapheme cluster boundary ≤ pos. */
export function snapGraphemeBoundary(source: string, pos: number): number {
  if (pos <= 0) return 0;
  if (pos >= source.length) return source.length;
  let boundary = 0;
  for (const seg of GRAPHEME_SEG.segment(source)) {
    if (seg.index > pos) return boundary;
    boundary = seg.index;
  }
  return boundary;
}

/**
 * Split a sub-range of `source` by `separator`.
 * Empty separator splits into individual grapheme clusters.
 * The separator itself is excluded from the returned ranges (it becomes a gap).
 */
export function splitByString(source: string, range: Range, separator: string): Range[] {
  if (separator === '') {
    const text = source.slice(range.start, range.end);
    return Array.from(GRAPHEME_SEG.segment(text), ({ index, segment }) => ({
      start: range.start + index,
      end: range.start + index + segment.length,
    }));
  }

  const text = source.slice(range.start, range.end);
  const parts: Range[] = [];
  let from = 0;

  let idx = text.indexOf(separator, from);
  while (idx !== -1) {
    if (idx > from) {
      parts.push({ start: range.start + from, end: range.start + idx });
    }
    from = idx + separator.length;
    idx = text.indexOf(separator, from);
  }

  if (from < text.length) {
    parts.push({ start: range.start + from, end: range.end });
  }

  return parts;
}

/**
 * Greedily pack `ranges` into Chunks of at most `chunkSize` measure units,
 * with `chunkOverlap` units of tail re-included in the next chunk.
 * Matches the LangChain _merge_splits algorithm.
 */
export function mergeRanges(
  source: string,
  ranges: ReadonlyArray<Range>,
  measure: Measure,
  chunkSize: number,
  chunkOverlap: number,
): Chunk[] {
  const chunks: Chunk[] = [];
  const current: Range[] = [];
  let currentSize = 0;

  const flush = (): void => {
    if (current.length === 0) return;
    const first = current.at(0);
    const last = current.at(-1);
    if (first === undefined || last === undefined) return;
    chunks.push({ start: first.start, end: last.end });
  };

  const shrink = (nextSize: number): void => {
    while (
      current.length > 0 &&
      (currentSize > chunkOverlap || (currentSize + nextSize > chunkSize && currentSize > 0))
    ) {
      const removed = current.shift();
      if (removed === undefined) break;
      currentSize -= measure(source.slice(removed.start, removed.end));
    }
  };

  for (const range of ranges) {
    const rangeSize = measure(source.slice(range.start, range.end));
    if (current.length > 0 && currentSize + rangeSize > chunkSize) {
      flush();
      shrink(rangeSize);
    }
    current.push(range);
    currentSize += rangeSize;
  }

  flush();
  return chunks;
}

/**
 * Recursively split a range using a priority-ordered list of separators.
 * Large sub-ranges are split with the next separator in the list.
 * Small sub-ranges are collected and merged with overlap via mergeRanges.
 */
export function recursiveSplit(
  source: string,
  range: Range,
  separators: readonly string[],
  measure: Measure,
  chunkSize: number,
  chunkOverlap: number,
): Chunk[] {
  const text = source.slice(range.start, range.end);
  if (measure(text) <= chunkSize) {
    return [{ start: range.start, end: range.end }];
  }

  let activeSep = '';
  let remainingSeps: readonly string[] = [];

  for (let i = 0; i < separators.length; i++) {
    const sep = separators[i];
    if (sep === undefined) continue;
    if (sep === '') {
      activeSep = '';
      remainingSeps = [];
      break;
    }
    if (text.includes(sep)) {
      activeSep = sep;
      remainingSeps = separators.slice(i + 1);
      break;
    }
  }

  const subRanges = splitByString(source, range, activeSep);
  const goodSplits: Range[] = [];
  const result: Chunk[] = [];

  for (const sub of subRanges) {
    const subSize = measure(source.slice(sub.start, sub.end));
    if (subSize <= chunkSize) {
      goodSplits.push(sub);
    } else {
      if (goodSplits.length > 0) {
        result.push(...mergeRanges(source, goodSplits, measure, chunkSize, chunkOverlap));
        goodSplits.splice(0);
      }
      if (remainingSeps.length > 0) {
        result.push(
          ...recursiveSplit(source, sub, remainingSeps, measure, chunkSize, chunkOverlap),
        );
      } else {
        result.push({ start: sub.start, end: sub.end });
      }
    }
  }

  if (goodSplits.length > 0) {
    result.push(...mergeRanges(source, goodSplits, measure, chunkSize, chunkOverlap));
  }

  return result;
}
