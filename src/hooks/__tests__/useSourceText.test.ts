import { renderHook, act } from '@testing-library/react';
import { useSourceText } from '../useSourceText';
import { DEFAULT_SAMPLE } from '@/samples';

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

describe('useSourceText', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', makeMockStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns default sample text when localStorage is empty', () => {
    const { result } = renderHook(() => useSourceText());
    expect(result.current[0]).toBe(DEFAULT_SAMPLE.text);
  });

  it('loads persisted text from localStorage on mount', () => {
    localStorage.setItem('cl-source', 'persisted text');
    const { result } = renderHook(() => useSourceText());
    expect(result.current[0]).toBe('persisted text');
  });

  it('saves text to localStorage when updated', () => {
    const { result } = renderHook(() => useSourceText());
    act(() => {
      result.current[1]('new text');
    });
    expect(localStorage.getItem('cl-source')).toBe('new text');
  });
});
