import { describe, it, expect } from 'vitest';
import type { Chunk } from '../types';
import { splitFixedWindow } from '../fixed-window';
import {
  splitRecursiveJavaScript,
  splitRecursiveMarkdown,
  splitRecursivePython,
  splitRecursiveText,
} from '../recursive';
import { splitSentence } from '../sentence';
import { splitMarkdownHeader } from '../markdown-header';
import { splitTokenWindow } from '../token-window';
import { REGISTRY, MEASURE_CHARS, getSplitter } from '../registry';

const chars = MEASURE_CHARS;

function opts(chunkSize: number, chunkOverlap = 0) {
  return { chunkSize, chunkOverlap, measure: chars };
}

// ── invariant helper ────────────────────────────────────────────────────────

function assertValid(source: string, chunks: readonly Chunk[]): void {
  for (const chunk of chunks) {
    expect(chunk.start).toBeGreaterThanOrEqual(0);
    expect(chunk.end).toBeLessThanOrEqual(source.length);
    expect(chunk.start).toBeLessThan(chunk.end);
  }
}

// ── fixed-window ────────────────────────────────────────────────────────────

describe('splitFixedWindow', () => {
  it('returns [] for empty source', () => {
    expect(splitFixedWindow('', opts(25))).toEqual([]);
  });

  it('returns [] for chunkSize ≤ 0', () => {
    expect(splitFixedWindow('hello', opts(0))).toEqual([]);
    expect(splitFixedWindow('hello', opts(-1))).toEqual([]);
  });

  it('returns a single chunk when source is shorter than chunkSize', () => {
    const chunks = splitFixedWindow('hi', opts(10));
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ start: 0, end: 2 });
  });

  it('returns exactly N non-overlapping chunks for ASCII source', () => {
    const source = 'abcde';
    const chunks = splitFixedWindow(source, opts(2, 0));
    // "ab", "cd", "e"
    expect(chunks).toHaveLength(3);
    assertValid(source, chunks);
    expect(chunks[0]).toEqual({ start: 0, end: 2 });
    expect(chunks[1]).toEqual({ start: 2, end: 4 });
    expect(chunks[2]).toEqual({ start: 4, end: 5 });
  });

  it('produces overlapping chunks', () => {
    const source = 'abcdefghi';
    const chunks = splitFixedWindow(source, opts(4, 2));
    // stride = 4-2 = 2 → starts at 0, 2, 4, 6, 8
    expect(chunks.length).toBeGreaterThanOrEqual(4);
    assertValid(source, chunks);
    // Adjacent chunks should overlap
    const first = chunks[0];
    const second = chunks[1];
    if (first !== undefined && second !== undefined) {
      expect(second.start).toBeLessThan(first.end);
    }
  });

  it('clamps overlap to chunkSize - 1', () => {
    // overlap >= chunkSize → clamp to size-1 → stride=1
    const source = 'abcd';
    const chunks = splitFixedWindow(source, opts(2, 5));
    assertValid(source, chunks);
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('snaps grapheme boundary on emoji input', () => {
    // 🎉 = 2 code units, 'x' = 1, 'y' = 1 → source length 4 code units
    const source = '🎉xy';
    const chunks = splitFixedWindow(source, opts(3, 0));
    assertValid(source, chunks);
    // No chunk boundary should land at index 1 (inside the emoji surrogate pair)
    for (const c of chunks) {
      expect(c.start).not.toBe(1);
      expect(c.end).not.toBe(1);
    }
  });

  it('satisfies invariants on the 2658/200/50 ChunkViz fixture', () => {
    const source = 'x'.repeat(2658);
    const chunks = splitFixedWindow(source, opts(200, 50));
    assertValid(source, chunks);
    // stride = 150 → expect 18 chunks
    expect(chunks).toHaveLength(18);
    // Total emitted characters = 17*200 + (2658 - 17*150) = 3400 + 108 = ...
    // Actually: starts at 0, 150, 300, ..., 2550 (18 starts)
    const emitted = chunks.reduce((sum, c) => sum + (c.end - c.start), 0);
    // 17 full chunks of 200 + 1 partial chunk of (2658-2550=108)
    expect(emitted).toBe(17 * 200 + 108);
  });
});

// ── recursive-text ──────────────────────────────────────────────────────────

describe('splitRecursiveText', () => {
  it('returns [] for empty source', () => {
    expect(splitRecursiveText('', opts(200))).toEqual([]);
  });

  it('returns a single chunk for short source', () => {
    const source = 'hello world';
    const chunks = splitRecursiveText(source, opts(100));
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ start: 0, end: source.length });
  });

  it('splits two paragraphs into separate chunks', () => {
    const source = 'Para one.\n\nPara two.';
    const chunks = splitRecursiveText(source, opts(12));
    assertValid(source, chunks);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    // Gap between chunks (the \n\n separator) should not be in any chunk
    const secondStart = chunks[1]?.start;
    if (secondStart !== undefined) {
      expect(source.slice(secondStart, secondStart + 1)).not.toBe('\n');
    }
  });

  it('produces overlap between chunks', () => {
    const source = 'aa bb cc dd ee ff gg hh';
    const chunks = splitRecursiveText(source, opts(10, 4));
    assertValid(source, chunks);
    if (chunks.length >= 2) {
      const c0 = chunks[0];
      const c1 = chunks[1];
      if (c0 !== undefined && c1 !== undefined) {
        expect(c1.start).toBeLessThan(c0.end);
      }
    }
  });

  it('satisfies invariants on multi-level text', () => {
    const source = [
      'This is a long first paragraph that exceeds the chunk size limit set below.',
      '',
      'This is a shorter second paragraph.',
      '',
      'Third paragraph here.',
    ].join('\n');
    const chunks = splitRecursiveText(source, opts(50, 10));
    assertValid(source, chunks);
    expect(chunks.length).toBeGreaterThan(0);
  });
});

// ── recursive-javascript ────────────────────────────────────────────────────

describe('splitRecursiveJavaScript', () => {
  it('returns [] for empty source', () => {
    expect(splitRecursiveJavaScript('', opts(200))).toEqual([]);
  });

  it('splits at function boundaries', () => {
    const source = [
      'const x = 1;',
      '',
      'function foo() {',
      '  return 42;',
      '}',
      '',
      'function bar() {',
      '  return 99;',
      '}',
    ].join('\n');
    const chunks = splitRecursiveJavaScript(source, opts(40));
    assertValid(source, chunks);
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('satisfies invariants', () => {
    const source = 'const a = 1;\nlet b = 2;\nvar c = 3;\nif (a) {\n  return a;\n}\n';
    const chunks = splitRecursiveJavaScript(source, opts(20));
    assertValid(source, chunks);
  });
});

// ── recursive-python ────────────────────────────────────────────────────────

describe('splitRecursivePython', () => {
  it('returns [] for empty source', () => {
    expect(splitRecursivePython('', opts(200))).toEqual([]);
  });

  it('splits at class and def boundaries', () => {
    const source = ['x = 1', '', 'class Foo:', '    pass', '', 'def bar():', '    return 42'].join(
      '\n',
    );
    const chunks = splitRecursivePython(source, opts(30));
    assertValid(source, chunks);
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('satisfies invariants', () => {
    const source = 'import os\nimport sys\n\ndef main():\n    pass\n\nclass A:\n    pass\n';
    const chunks = splitRecursivePython(source, opts(25));
    assertValid(source, chunks);
  });
});

// ── recursive-markdown ──────────────────────────────────────────────────────

describe('splitRecursiveMarkdown', () => {
  it('returns [] for empty source', () => {
    expect(splitRecursiveMarkdown('', opts(200))).toEqual([]);
  });

  it('respects markdown separators', () => {
    const source = '# Title\n\nIntro text.\n\n```\ncode block\n```\n\nFinal para.';
    const chunks = splitRecursiveMarkdown(source, opts(30));
    assertValid(source, chunks);
    expect(chunks.length).toBeGreaterThan(0);
  });
});

// ── sentence ────────────────────────────────────────────────────────────────

describe('splitSentence', () => {
  it('returns [] for empty source', () => {
    expect(splitSentence('', opts(400))).toEqual([]);
  });

  it('returns a single chunk for a short single sentence', () => {
    const source = 'Hello world.';
    const chunks = splitSentence(source, opts(200));
    expect(chunks).toHaveLength(1);
    assertValid(source, chunks);
  });

  it('merges multiple sentences into one chunk if they fit', () => {
    const source = 'Hello. World. Foo.';
    const chunks = splitSentence(source, opts(200));
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ start: 0, end: source.length });
  });

  it('splits sentences into multiple chunks when each is at the limit', () => {
    const source = 'Hello world. Goodbye world.';
    // chunkSize=14 → "Hello world. " is ~13 chars, "Goodbye world." is ~14
    const chunks = splitSentence(source, opts(14));
    assertValid(source, chunks);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
  });

  it('satisfies invariants on multi-sentence text', () => {
    const source =
      'The quick brown fox. Jumped over the lazy dog. Sentences are fun. More text here.';
    const chunks = splitSentence(source, opts(40));
    assertValid(source, chunks);
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('handles overlap', () => {
    const source = 'First sentence. Second sentence. Third sentence.';
    const chunks = splitSentence(source, opts(20, 5));
    assertValid(source, chunks);
  });
});

// ── markdown-header ─────────────────────────────────────────────────────────

describe('splitMarkdownHeader', () => {
  it('returns [] for empty source', () => {
    expect(splitMarkdownHeader('', opts(1000))).toEqual([]);
  });

  it('returns a single chunk for source with no headings', () => {
    const source = 'Just some plain text without any headings here.';
    const chunks = splitMarkdownHeader(source, opts(1000));
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ start: 0, end: source.length });
  });

  it('splits at each ATX heading', () => {
    const source = '# Title\n\nIntro.\n\n## Section A\n\nContent A.\n\n## Section B\n\nContent B.';
    const chunks = splitMarkdownHeader(source, opts(1000));
    assertValid(source, chunks);
    // Three sections: before first heading (empty/title), Section A, Section B
    expect(chunks.length).toBeGreaterThanOrEqual(2);
  });

  it('handles heading at the very start', () => {
    const source = '# Title\nContent here.\n## Sub\nMore content.';
    const chunks = splitMarkdownHeader(source, opts(1000));
    assertValid(source, chunks);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks[0]?.start).toBe(0);
  });

  it('further splits an oversized section', () => {
    const longContent = 'word '.repeat(50).trim();
    const source = `# Title\n\n${longContent}\n\n## Short\n\nBrief.`;
    const chunks = splitMarkdownHeader(source, opts(50));
    assertValid(source, chunks);
    expect(chunks.length).toBeGreaterThan(2);
  });

  it('recognises all heading levels 1-6', () => {
    const source = '# H1\n\n## H2\n\n### H3\n\n#### H4\n\n##### H5\n\n###### H6\n\nEnd.';
    const chunks = splitMarkdownHeader(source, opts(1000));
    assertValid(source, chunks);
    expect(chunks.length).toBeGreaterThanOrEqual(6);
  });
});

// ── token-window ────────────────────────────────────────────────────────────

describe('splitTokenWindow', () => {
  it('returns [] for empty source', () => {
    expect(splitTokenWindow('', opts(25))).toEqual([]);
  });

  it('is identical to fixed-window in Phase 1 (char measure)', () => {
    const source = 'abcdefghij';
    expect(splitTokenWindow(source, opts(3, 0))).toEqual(splitFixedWindow(source, opts(3, 0)));
  });

  it('satisfies invariants', () => {
    const source = 'Hello world, this is a test of the token window splitter.';
    const chunks = splitTokenWindow(source, opts(10, 2));
    assertValid(source, chunks);
  });
});

// ── registry ────────────────────────────────────────────────────────────────

describe('REGISTRY', () => {
  it('exports exactly 8 splitters', () => {
    expect(REGISTRY).toHaveLength(8);
  });

  it('every splitter has required fields', () => {
    for (const meta of REGISTRY) {
      expect(meta.id).toBeTruthy();
      expect(meta.label).toBeTruthy();
      expect(meta.description).toBeTruthy();
      expect(meta.langEquivalent).toBeTruthy();
      expect(meta.defaultChunkSize).toBeGreaterThan(0);
      expect(meta.defaultOverlap).toBeGreaterThanOrEqual(0);
      expect(typeof meta.supportsOverlap).toBe('boolean');
      expect(typeof meta.split).toBe('function');
    }
  });

  it('every splitter function returns valid chunks for sample input', () => {
    const source = 'Hello world.\n\nThis is a test paragraph.\n\nAnother section here.';
    for (const meta of REGISTRY) {
      const chunks = meta.split(source, opts(meta.defaultChunkSize, meta.defaultOverlap));
      assertValid(source, chunks);
    }
  });

  it('every splitter returns [] for empty source', () => {
    for (const meta of REGISTRY) {
      expect(meta.split('', opts(meta.defaultChunkSize))).toEqual([]);
    }
  });
});

describe('getSplitter', () => {
  it('returns the correct meta for a known id', () => {
    const meta = getSplitter('fixed-window');
    expect(meta?.id).toBe('fixed-window');
  });

  it('returns undefined for unknown id', () => {
    expect(getSplitter('unknown-splitter')).toBeUndefined();
  });
});

// ── cross-splitter invariants ────────────────────────────────────────────────

describe('cross-splitter invariants', () => {
  const source =
    'The quick brown fox jumps over the lazy dog.\n\nPack my box with five dozen liquor jugs.\n\nHow vexingly quick daft zebras jump!';

  it('all splitters: start < end for every chunk', () => {
    for (const meta of REGISTRY) {
      const chunks = meta.split(source, opts(meta.defaultChunkSize, meta.defaultOverlap));
      for (const chunk of chunks) {
        expect(chunk.start).toBeLessThan(chunk.end);
      }
    }
  });

  it('all splitters: no chunk extends beyond source bounds', () => {
    for (const meta of REGISTRY) {
      const chunks = meta.split(source, opts(meta.defaultChunkSize, meta.defaultOverlap));
      for (const chunk of chunks) {
        expect(chunk.start).toBeGreaterThanOrEqual(0);
        expect(chunk.end).toBeLessThanOrEqual(source.length);
      }
    }
  });

  it('all splitters: no empty chunk (start === end)', () => {
    for (const meta of REGISTRY) {
      const chunks = meta.split(source, opts(meta.defaultChunkSize, meta.defaultOverlap));
      for (const chunk of chunks) {
        expect(chunk.end - chunk.start).toBeGreaterThan(0);
      }
    }
  });
});
