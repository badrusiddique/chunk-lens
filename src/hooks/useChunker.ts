import { useEffect, useMemo, useState } from 'react';
import type { Chunk, SplitterId, SplitterOptions } from '@/lib/splitters/types';
import { getSplitter, MEASURE_CHARS, REGISTRY } from '@/lib/splitters/registry';

export const RENDER_BUDGET = 2000;

interface StoredParams {
  splitterId: SplitterId;
  chunkSize: number;
  chunkOverlap: number;
}

const STORAGE_KEY = 'cl-params';
const DEFAULT_ID: SplitterId = 'fixed-window';

function loadParams(): StoredParams | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Record<string, unknown>;
    if (
      typeof p['splitterId'] !== 'string' ||
      typeof p['chunkSize'] !== 'number' ||
      typeof p['chunkOverlap'] !== 'number'
    )
      return null;
    const id = p['splitterId'];
    if (!REGISTRY.some((m) => m.id === id)) return null;
    return p as unknown as StoredParams;
  } catch {
    return null;
  }
}

function defaultsFor(id: SplitterId): { chunkSize: number; chunkOverlap: number } {
  const meta = getSplitter(id);
  return {
    chunkSize: meta?.defaultChunkSize ?? 200,
    chunkOverlap: meta?.defaultOverlap ?? 0,
  };
}

export interface ChunkerState {
  splitterId: SplitterId;
  chunkSize: number;
  chunkOverlap: number;
  chunks: readonly Chunk[];
  isBudgetExceeded: boolean;
}

export interface ChunkerControls {
  setSplitterId: (id: SplitterId) => void;
  setChunkSize: (n: number) => void;
  setChunkOverlap: (n: number) => void;
}

export function useChunker(source: string): ChunkerState & ChunkerControls {
  const [splitterId, setSplitterIdRaw] = useState<SplitterId>(
    () => loadParams()?.splitterId ?? DEFAULT_ID,
  );
  const [chunkSize, setChunkSizeRaw] = useState<number>(
    () => loadParams()?.chunkSize ?? defaultsFor(DEFAULT_ID).chunkSize,
  );
  const [chunkOverlap, setChunkOverlapRaw] = useState<number>(
    () => loadParams()?.chunkOverlap ?? defaultsFor(DEFAULT_ID).chunkOverlap,
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ splitterId, chunkSize, chunkOverlap }));
    } catch {
      // storage quota exceeded — silent fail
    }
  }, [splitterId, chunkSize, chunkOverlap]);

  const { chunks, isBudgetExceeded } = useMemo(() => {
    const meta = getSplitter(splitterId);
    if (!meta || source.length === 0) return { chunks: [] as Chunk[], isBudgetExceeded: false };
    const opts: SplitterOptions = { chunkSize, chunkOverlap, measure: MEASURE_CHARS };
    const all = meta.split(source, opts);
    if (all.length > RENDER_BUDGET) {
      return { chunks: all.slice(0, RENDER_BUDGET), isBudgetExceeded: true };
    }
    return { chunks: all, isBudgetExceeded: false };
  }, [source, splitterId, chunkSize, chunkOverlap]);

  const setSplitterId = (id: SplitterId): void => {
    setSplitterIdRaw(id);
    const d = defaultsFor(id);
    setChunkSizeRaw(d.chunkSize);
    setChunkOverlapRaw(d.chunkOverlap);
  };

  const setChunkSize = (n: number): void => {
    setChunkSizeRaw(n);
    setChunkOverlapRaw((prev) => Math.min(prev, Math.max(0, n - 1)));
  };

  const setChunkOverlap = (n: number): void => {
    setChunkOverlapRaw(Math.min(n, Math.max(0, chunkSize - 1)));
  };

  return {
    splitterId,
    chunkSize,
    chunkOverlap,
    chunks,
    isBudgetExceeded,
    setSplitterId,
    setChunkSize,
    setChunkOverlap,
  };
}
