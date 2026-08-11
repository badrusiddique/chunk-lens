import { useState, useEffect } from 'react';
import { DEFAULT_SAMPLE } from '@/samples';

const STORAGE_KEY = 'cl-source';

export function useSourceText(): [string, (text: string) => void] {
  const [text, setText] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ?? DEFAULT_SAMPLE.text;
    } catch {
      return DEFAULT_SAMPLE.text;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, text);
    } catch {
      // Storage quota exceeded — silent fail
    }
  }, [text]);

  return [text, setText];
}
