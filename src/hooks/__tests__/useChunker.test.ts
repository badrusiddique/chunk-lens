import { renderHook, act } from '@testing-library/react';
import { useChunker, RENDER_BUDGET } from '../useChunker';

function makeMockStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

describe('useChunker', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', makeMockStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to fixed-window strategy', () => {
    const { result } = renderHook(() => useChunker('hello world'));
    expect(result.current.splitterId).toBe('fixed-window');
  });

  it('returns empty chunks when source is empty', () => {
    const { result } = renderHook(() => useChunker(''));
    expect(result.current.chunks).toHaveLength(0);
    expect(result.current.isBudgetExceeded).toBe(false);
  });

  it('computes chunks for non-empty source', () => {
    const { result } = renderHook(() => useChunker('hello world'));
    expect(result.current.chunks.length).toBeGreaterThan(0);
  });

  it('setSplitterId resets chunkSize and chunkOverlap to strategy defaults', () => {
    const { result } = renderHook(() => useChunker('hello world'));
    act(() => {
      result.current.setChunkSize(99);
      result.current.setChunkOverlap(10);
    });
    act(() => {
      result.current.setSplitterId('recursive-text');
    });
    // recursive-text defaults: size=200, overlap=50
    expect(result.current.chunkSize).toBe(200);
    expect(result.current.chunkOverlap).toBe(50);
    expect(result.current.splitterId).toBe('recursive-text');
  });

  it('setChunkSize clamps overlap to chunkSize - 1', () => {
    const { result } = renderHook(() => useChunker('hello world'));
    act(() => {
      result.current.setChunkSize(25);
      result.current.setChunkOverlap(20);
    });
    act(() => {
      result.current.setChunkSize(10);
    });
    expect(result.current.chunkOverlap).toBeLessThan(result.current.chunkSize);
    expect(result.current.chunkOverlap).toBe(9);
  });

  it('setChunkOverlap clamps to chunkSize - 1', () => {
    const { result } = renderHook(() => useChunker('hello world'));
    act(() => {
      result.current.setChunkSize(10);
    });
    act(() => {
      result.current.setChunkOverlap(999);
    });
    expect(result.current.chunkOverlap).toBe(9);
  });

  it('persists params to localStorage', () => {
    const { result } = renderHook(() => useChunker('test'));
    act(() => {
      result.current.setSplitterId('sentence');
    });
    const stored = JSON.parse(localStorage.getItem('cl-params') ?? '{}') as {
      splitterId: string;
    };
    expect(stored.splitterId).toBe('sentence');
  });

  it('loads persisted params from localStorage on mount', () => {
    localStorage.setItem(
      'cl-params',
      JSON.stringify({ splitterId: 'recursive-python', chunkSize: 300, chunkOverlap: 75 }),
    );
    const { result } = renderHook(() => useChunker('test'));
    expect(result.current.splitterId).toBe('recursive-python');
    expect(result.current.chunkSize).toBe(300);
    expect(result.current.chunkOverlap).toBe(75);
  });

  it('falls back to defaults when stored params are invalid JSON', () => {
    localStorage.setItem('cl-params', 'not-json{');
    const { result } = renderHook(() => useChunker('hello'));
    expect(result.current.splitterId).toBe('fixed-window');
  });

  it('falls back to defaults when stored splitterId is unknown', () => {
    localStorage.setItem(
      'cl-params',
      JSON.stringify({ splitterId: 'unknown-strategy', chunkSize: 100, chunkOverlap: 0 }),
    );
    const { result } = renderHook(() => useChunker('hello'));
    expect(result.current.splitterId).toBe('fixed-window');
  });

  it('sets isBudgetExceeded when chunks exceed RENDER_BUDGET', () => {
    // chunkSize=1 on a string of length > RENDER_BUDGET triggers the cap
    const longSource = 'x'.repeat(RENDER_BUDGET + 100);
    const { result } = renderHook(() => useChunker(longSource));
    act(() => {
      result.current.setChunkSize(1);
      result.current.setChunkOverlap(0);
    });
    expect(result.current.isBudgetExceeded).toBe(true);
    expect(result.current.chunks).toHaveLength(RENDER_BUDGET);
  });
});
