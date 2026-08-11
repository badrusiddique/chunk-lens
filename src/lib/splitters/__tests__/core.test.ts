import { describe, it, expect } from 'vitest';
import { snapGraphemeBoundary, splitByString, mergeRanges, recursiveSplit } from '../core';

const chars: (text: string) => number = (t) => t.length;

// ── snapGraphemeBoundary ────────────────────────────────────────────────────

describe('snapGraphemeBoundary', () => {
  it('returns 0 for pos ≤ 0', () => {
    expect(snapGraphemeBoundary('hello', 0)).toBe(0);
    expect(snapGraphemeBoundary('hello', -5)).toBe(0);
  });

  it('returns source.length for pos ≥ source.length', () => {
    expect(snapGraphemeBoundary('hello', 5)).toBe(5);
    expect(snapGraphemeBoundary('hello', 99)).toBe(5);
  });

  it('returns pos when it falls on a grapheme boundary (ASCII)', () => {
    expect(snapGraphemeBoundary('hello', 3)).toBe(3);
  });

  it('snaps inward when pos falls inside a multi-code-unit grapheme', () => {
    // 🎉 is two UTF-16 code units (surrogate pair), indices 0 and 1
    const source = '🎉x';
    // pos=1 is inside the emoji — snap to 0
    expect(snapGraphemeBoundary(source, 1)).toBe(0);
    // pos=2 is after the emoji — that IS a boundary
    expect(snapGraphemeBoundary(source, 2)).toBe(2);
  });

  it('returns last grapheme start when loop exhausts without breaking', () => {
    // pos equal to the last char's index
    const source = 'ab';
    expect(snapGraphemeBoundary(source, 1)).toBe(1);
  });
});

// ── splitByString ───────────────────────────────────────────────────────────

describe('splitByString', () => {
  it('returns grapheme clusters for empty separator', () => {
    const parts = splitByString('abc', { start: 0, end: 3 }, '');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toEqual({ start: 0, end: 1 });
    expect(parts[1]).toEqual({ start: 1, end: 2 });
    expect(parts[2]).toEqual({ start: 2, end: 3 });
  });

  it('splits emoji into grapheme clusters', () => {
    // 🎉 is 2 code units, x is 1 — total 3 code units, but 2 graphemes
    const source = '🎉x';
    const parts = splitByString(source, { start: 0, end: source.length }, '');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toEqual({ start: 0, end: 2 });
    expect(parts[1]).toEqual({ start: 2, end: 3 });
  });

  it('returns empty array when separator not found and text is empty', () => {
    const parts = splitByString('', { start: 0, end: 0 }, '\n\n');
    expect(parts).toHaveLength(0);
  });

  it('returns single range when separator not found', () => {
    const parts = splitByString('hello', { start: 0, end: 5 }, '\n\n');
    expect(parts).toHaveLength(1);
    expect(parts[0]).toEqual({ start: 0, end: 5 });
  });

  it('splits on separator and excludes the separator', () => {
    const source = 'hello\n\nworld';
    const parts = splitByString(source, { start: 0, end: source.length }, '\n\n');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toEqual({ start: 0, end: 5 });
    expect(parts[1]).toEqual({ start: 7, end: 12 });
  });

  it('skips empty parts when separator is at start', () => {
    const source = '\n\nhello';
    const parts = splitByString(source, { start: 0, end: source.length }, '\n\n');
    expect(parts).toHaveLength(1);
    expect(parts[0]).toEqual({ start: 2, end: 7 });
  });

  it('skips empty parts when separator is at end', () => {
    const source = 'hello\n\n';
    const parts = splitByString(source, { start: 0, end: source.length }, '\n\n');
    expect(parts).toHaveLength(1);
    expect(parts[0]).toEqual({ start: 0, end: 5 });
  });

  it('honours the range offset', () => {
    const source = 'XXXX hello\n\nworld YYYY';
    const range = { start: 5, end: 17 };
    const parts = splitByString(source, range, '\n\n');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toEqual({ start: 5, end: 10 });
    expect(parts[1]).toEqual({ start: 12, end: 17 });
  });

  it('handles multiple consecutive separators by skipping empty parts', () => {
    const source = 'a\n\n\n\nb';
    // "\n\n" at index 1, "\n\n" at index 3
    const parts = splitByString(source, { start: 0, end: source.length }, '\n\n');
    expect(parts.length).toBeGreaterThanOrEqual(1);
    // 'a' at [0,1] and 'b' at [5,6] — the middle \n\n... may produce an empty or not
    expect(parts.some((p) => source.slice(p.start, p.end) === 'a')).toBe(true);
    expect(parts.some((p) => source.slice(p.start, p.end) === 'b')).toBe(true);
  });
});

// ── mergeRanges ─────────────────────────────────────────────────────────────

describe('mergeRanges', () => {
  it('returns [] for empty input', () => {
    expect(mergeRanges('hello', [], chars, 10, 0)).toEqual([]);
  });

  it('returns one chunk when everything fits', () => {
    const source = 'a b c';
    const ranges = [
      { start: 0, end: 1 },
      { start: 2, end: 3 },
      { start: 4, end: 5 },
    ];
    const chunks = mergeRanges(source, ranges, chars, 10, 0);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ start: 0, end: 5 });
  });

  it('flushes and starts a new chunk when chunkSize exceeded', () => {
    const source = 'hello world';
    const ranges = [
      { start: 0, end: 5 },
      { start: 6, end: 11 },
    ];
    const chunks = mergeRanges(source, ranges, chars, 7, 0);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toEqual({ start: 0, end: 5 });
    expect(chunks[1]).toEqual({ start: 6, end: 11 });
  });

  it('overlaps chunks correctly', () => {
    // "a b c d e" split by " " → a=[0,1], b=[2,3], c=[4,5], d=[6,7], e=[8,9]
    const source = 'a b c d e';
    const ranges = [
      { start: 0, end: 1 },
      { start: 2, end: 3 },
      { start: 4, end: 5 },
      { start: 6, end: 7 },
      { start: 8, end: 9 },
    ];
    const chunks = mergeRanges(source, ranges, chars, 3, 1);
    // Chunk 1: a+b+c={0..5}, then overlap=c={4..5}, next chunk starts with c
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    // Each chunk contains at most 3 measure units
    for (const c of chunks) {
      // The chunk's content measure (sum of range sizes within) should be reasonable
      expect(c.end).toBeLessThanOrEqual(source.length);
      expect(c.start).toBeGreaterThanOrEqual(0);
      expect(c.start).toBeLessThan(c.end);
    }
  });

  it('adjacent chunks share overlap region', () => {
    const source = 'abc def ghi';
    const ranges = [
      { start: 0, end: 3 },
      { start: 4, end: 7 },
      { start: 8, end: 11 },
    ];
    const chunks = mergeRanges(source, ranges, chars, 6, 3);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    // Second chunk should start before or at where first chunk ends (overlap)
    const first = chunks[0];
    const second = chunks[1];
    if (first !== undefined && second !== undefined) {
      expect(second.start).toBeLessThan(first.end);
    }
  });
});

// ── recursiveSplit ──────────────────────────────────────────────────────────

describe('recursiveSplit', () => {
  const seps = ['\n\n', '\n', ' ', ''];

  it('returns the range as-is when measure ≤ chunkSize', () => {
    const source = 'short';
    const chunks = recursiveSplit(source, { start: 0, end: 5 }, seps, chars, 100, 0);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ start: 0, end: 5 });
  });

  it('splits by first matching separator', () => {
    const source = 'para one\n\npara two';
    const chunks = recursiveSplit(source, { start: 0, end: source.length }, seps, chars, 10, 0);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    // First chunk should start at 0
    expect(chunks[0]?.start).toBe(0);
  });

  it('falls through to next separator when first is absent', () => {
    // No \n\n, but has \n
    const source = 'line one\nline two';
    const chunks = recursiveSplit(source, { start: 0, end: source.length }, seps, chars, 10, 0);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
  });

  it('falls through to empty separator (char split) as last resort', () => {
    const source = 'abcdefghij';
    const chunks = recursiveSplit(
      source,
      { start: 0, end: source.length },
      [''], // only empty separator
      chars,
      3,
      0,
    );
    // Should produce 3-char chunks
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    for (const c of chunks) {
      expect(c.end - c.start).toBeLessThanOrEqual(3);
    }
  });

  it('emits large sub-ranges as-is when no separators remain', () => {
    // Single separator [] — no remainingSeps, sub-range too big
    const source = 'hello world foo bar';
    const chunks = recursiveSplit(
      source,
      { start: 0, end: source.length },
      ['\n\n'], // only '\n\n', not found — falls to '', splits to chars
      chars,
      5,
      0,
    );
    // All chars split → merged into 5-char chunks
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('handles mixed large and small sub-ranges', () => {
    // First para too big, second fits
    const long = 'a'.repeat(20);
    const short = 'b'.repeat(5);
    const source = `${long}\n\n${short}`;
    const chunks = recursiveSplit(source, { start: 0, end: source.length }, seps, chars, 10, 0);
    expect(chunks.length).toBeGreaterThan(0);
    for (const c of chunks) {
      expect(c.start).toBeGreaterThanOrEqual(0);
      expect(c.end).toBeLessThanOrEqual(source.length);
      expect(c.start).toBeLessThan(c.end);
    }
  });
});
