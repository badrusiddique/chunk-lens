import type { Chunk, SplitterOptions } from './types';
import { splitFixedWindow } from './fixed-window';

/**
 * Fixed window in token space.
 * Phase 1: uses character count (identical to fixed-window).
 * Phase 2: will use real BPE token boundaries via js-tiktoken.
 */
export function splitTokenWindow(source: string, opts: SplitterOptions): readonly Chunk[] {
  return splitFixedWindow(source, opts);
}
