import { computeStats } from '../stats';
import { splitFixedWindow } from '../splitters/fixed-window';
import { MEASURE_CHARS } from '../splitters/registry';

describe('computeStats', () => {
  it('returns all zeros for empty source', () => {
    expect(computeStats('', [])).toEqual({
      inputChars: 0,
      emittedChars: 0,
      uniqueChars: 0,
      duplicatedChars: 0,
    });
  });

  it('returns inputChars > 0 but all others 0 when no chunks', () => {
    expect(computeStats('hello', [])).toEqual({
      inputChars: 5,
      emittedChars: 0,
      uniqueChars: 0,
      duplicatedChars: 0,
    });
  });

  it('single chunk covering full source: input == emitted == unique, duplicated == 0', () => {
    const stats = computeStats('hello world', [{ start: 0, end: 11 }]);
    expect(stats.inputChars).toBe(11);
    expect(stats.emittedChars).toBe(11);
    expect(stats.uniqueChars).toBe(11);
    expect(stats.duplicatedChars).toBe(0);
  });

  it('two non-overlapping chunks: emitted == unique, duplicated == 0', () => {
    const stats = computeStats('abcdefghij', [
      { start: 0, end: 5 },
      { start: 5, end: 10 },
    ]);
    expect(stats.emittedChars).toBe(10);
    expect(stats.uniqueChars).toBe(10);
    expect(stats.duplicatedChars).toBe(0);
  });

  it('two overlapping chunks: emitted > unique, duplicated > 0', () => {
    // [0,8) and [5,13) on a 13-char source — overlap = 3 chars
    const stats = computeStats('abcdefghijklm', [
      { start: 0, end: 8 },
      { start: 5, end: 13 },
    ]);
    expect(stats.emittedChars).toBe(16); // 8 + 8
    expect(stats.uniqueChars).toBe(13); // [0,13) union = 13
    expect(stats.duplicatedChars).toBe(3); // chars 5,6,7 duplicated
  });

  it('two chunks with gap in source: unique < input', () => {
    // source: 20 chars, chunks cover [0,5) and [10,15) — gap [5,10) and [15,20)
    const stats = computeStats('x'.repeat(20), [
      { start: 0, end: 5 },
      { start: 10, end: 15 },
    ]);
    expect(stats.inputChars).toBe(20);
    expect(stats.emittedChars).toBe(10); // 5+5
    expect(stats.uniqueChars).toBe(10); // [0,5) + [10,15) = 5+5
    expect(stats.duplicatedChars).toBe(0);
  });

  it('golden case: 2658-char source, fixed-window size=200, overlap=50', () => {
    // This is the exact case where ChunkViz reports "Total Characters: 3508"
    // (reporting emitted chars, not input chars)
    const source = 'x'.repeat(2658);
    const chunks = splitFixedWindow(source, {
      chunkSize: 200,
      chunkOverlap: 50,
      measure: MEASURE_CHARS,
    });
    const stats = computeStats(source, chunks);

    expect(stats.inputChars).toBe(2658); // actual source length (what ChunkViz shows wrong)
    expect(stats.emittedChars).toBe(3508); // what ChunkViz incorrectly labels "Total Characters"
    expect(stats.uniqueChars).toBe(2658); // fixed-window covers entire source exactly
    expect(stats.duplicatedChars).toBe(850); // 3508 - 2658
  });

  it('duplicatedChars invariant: emitted == unique + duplicated', () => {
    const stats = computeStats('abcdefghij', [
      { start: 0, end: 6 },
      { start: 4, end: 10 },
    ]);
    expect(stats.emittedChars).toBe(stats.uniqueChars + stats.duplicatedChars);
  });

  it('handles chunks in any order (unsorted input)', () => {
    // Provide chunks in reverse order
    const stats = computeStats('abcdefghij', [
      { start: 5, end: 10 },
      { start: 0, end: 5 },
    ]);
    expect(stats.uniqueChars).toBe(10);
    expect(stats.duplicatedChars).toBe(0);
  });
});
