import type { Chunk } from './splitters/types';

const NUM_COLORS = 8;

export interface ChunkRun {
  readonly kind: 'chunk';
  readonly start: number;
  readonly end: number;
  readonly chunkIndex: number;
  readonly colorIndex: number;
}

export interface OverlapRun {
  readonly kind: 'overlap';
  readonly start: number;
  readonly end: number;
  readonly colorIndex: number;
}

export interface GapRun {
  readonly kind: 'gap';
  readonly start: number;
  readonly end: number;
}

export type RenderRun = ChunkRun | OverlapRun | GapRun;

export function toRenderRuns(source: string, chunks: readonly Chunk[]): readonly RenderRun[] {
  if (source.length === 0) return [];

  type Event = { readonly pos: number; readonly open: boolean; readonly idx: number };

  const events: Event[] = chunks.flatMap((c, i) => [
    { pos: c.start, open: true, idx: i },
    { pos: c.end, open: false, idx: i },
  ]);

  // Opens before closes at the same position
  events.sort((a, b) => a.pos - b.pos || (a.open ? -1 : 1));

  const active = new Set<number>();
  const runs: RenderRun[] = [];
  let lastPos = 0;

  function flush(end: number): void {
    const start = lastPos;
    if (start < end) {
      if (active.size === 0) {
        runs.push({ kind: 'gap', start, end });
      } else {
        // Find the minimum active chunk index to determine the primary color
        const firstResult = active.values().next();
        if (!firstResult.done) {
          let minChunkIdx = firstResult.value;
          for (const idx of active) {
            if (idx < minChunkIdx) minChunkIdx = idx;
          }
          if (active.size === 1) {
            runs.push({
              kind: 'chunk',
              start,
              end,
              chunkIndex: minChunkIdx,
              colorIndex: minChunkIdx % NUM_COLORS,
            });
          } else {
            runs.push({ kind: 'overlap', start, end, colorIndex: minChunkIdx % NUM_COLORS });
          }
        }
      }
    }
    lastPos = end;
  }

  for (const event of events) {
    flush(event.pos);
    if (event.open) {
      active.add(event.idx);
    } else {
      active.delete(event.idx);
    }
  }

  // Source text after the last chunk closes
  flush(source.length);

  return runs;
}
