import { toRenderRuns } from '../segments';
import type { Chunk } from '../splitters/types';

const src = 'abcdefghijklmnopqrstuvwxyz'; // 26 chars, a=0..z=25

function chunk(start: number, end: number): Chunk {
  return { start, end };
}

describe('toRenderRuns', () => {
  it('returns empty array for empty source', () => {
    expect(toRenderRuns('', [chunk(0, 5)])).toEqual([]);
  });

  it('returns a single gap when source is non-empty but chunks is empty', () => {
    const runs = toRenderRuns(src, []);
    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject({ kind: 'gap', start: 0, end: 26 });
  });

  it('returns a single chunk run when source equals one chunk exactly', () => {
    const runs = toRenderRuns(src, [chunk(0, 26)]);
    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject({
      kind: 'chunk',
      start: 0,
      end: 26,
      chunkIndex: 0,
      colorIndex: 0,
    });
  });

  it('emits a leading gap before the first chunk', () => {
    const runs = toRenderRuns(src, [chunk(5, 15)]);
    expect(runs[0]).toMatchObject({ kind: 'gap', start: 0, end: 5 });
    expect(runs[1]).toMatchObject({ kind: 'chunk', start: 5, end: 15, chunkIndex: 0 });
    expect(runs[2]).toMatchObject({ kind: 'gap', start: 15, end: 26 });
  });

  it('emits a trailing gap after the last chunk', () => {
    const runs = toRenderRuns(src, [chunk(0, 10)]);
    expect(runs[0]).toMatchObject({ kind: 'chunk', start: 0, end: 10 });
    expect(runs[1]).toMatchObject({ kind: 'gap', start: 10, end: 26 });
  });

  it('emits two adjacent chunk runs when chunks do not overlap', () => {
    const runs = toRenderRuns(src, [chunk(0, 10), chunk(10, 20)]);
    expect(runs).toHaveLength(3); // chunk0, chunk1, trailing gap
    expect(runs[0]).toMatchObject({ kind: 'chunk', start: 0, end: 10, chunkIndex: 0 });
    expect(runs[1]).toMatchObject({ kind: 'chunk', start: 10, end: 20, chunkIndex: 1 });
    expect(runs[2]).toMatchObject({ kind: 'gap', start: 20, end: 26 });
  });

  it('emits an overlap run where two chunks intersect', () => {
    // chunk0: 0-15, chunk1: 10-25 → overlap at 10-15
    const runs = toRenderRuns(src, [chunk(0, 15), chunk(10, 25)]);
    const overlapRun = runs.find((r) => r.kind === 'overlap');
    expect(overlapRun).toBeDefined();
    expect(overlapRun).toMatchObject({ kind: 'overlap', start: 10, end: 15 });
  });

  it('chunk run before overlap, overlap, chunk run after overlap', () => {
    // chunk0: 0-15, chunk1: 10-25
    const runs = toRenderRuns(src, [chunk(0, 15), chunk(10, 25)]);
    expect(runs[0]).toMatchObject({ kind: 'chunk', start: 0, end: 10, chunkIndex: 0 });
    expect(runs[1]).toMatchObject({ kind: 'overlap', start: 10, end: 15 });
    expect(runs[2]).toMatchObject({ kind: 'chunk', start: 15, end: 25, chunkIndex: 1 });
    expect(runs[3]).toMatchObject({ kind: 'gap', start: 25, end: 26 });
  });

  it('color index cycles with 8 colors', () => {
    // 9 non-overlapping chunks, chunkIndex 8 should have colorIndex 0 again
    const nineChunks = Array.from({ length: 9 }, (_, i) => chunk(i * 2, i * 2 + 2));
    // source needs to be long enough
    const longSrc = 'x'.repeat(20);
    const runs = toRenderRuns(longSrc, nineChunks);
    const chunkRuns = runs.filter((r) => r.kind === 'chunk');
    expect(chunkRuns[0]).toMatchObject({ colorIndex: 0 });
    expect(chunkRuns[7]).toMatchObject({ colorIndex: 7 });
    expect(chunkRuns[8]).toMatchObject({ colorIndex: 0 }); // wraps
  });

  it('runs cover the full source without gaps in indices', () => {
    const chunks = [chunk(0, 10), chunk(8, 16), chunk(16, 26)];
    const runs = toRenderRuns(src, chunks);
    // Check that runs are contiguous and cover [0, 26)
    let pos = 0;
    for (const run of runs) {
      expect(run.start).toBe(pos);
      pos = run.end;
    }
    expect(pos).toBe(src.length);
  });

  it('handles a zero-length overlap (adjacent chunks share a boundary)', () => {
    // chunk0: 0-10, chunk1: 10-20 — boundary at 10 is shared but zero-width overlap
    const runs = toRenderRuns(src, [chunk(0, 10), chunk(10, 20)]);
    // No overlap run should be emitted since the overlap range is zero-width
    expect(runs.some((r) => r.kind === 'overlap')).toBe(false);
  });
});
