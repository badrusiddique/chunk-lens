import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Chunk } from '@/lib/splitters/types';
import { toRenderRuns } from '@/lib/segments';

interface Props {
  source: string;
  chunks: readonly Chunk[];
}

export function ChunkCanvas({ source, chunks }: Props) {
  const runs = useMemo(() => toRenderRuns(source, chunks), [source, chunks]);

  // Indices into `runs` that are keyboard-navigable (chunk or overlap)
  const interactiveRunIndices = useMemo(
    () =>
      runs.reduce<number[]>((acc, r, i) => {
        if (r.kind !== 'gap') acc.push(i);
        return acc;
      }, []),
    [runs],
  );

  const [activeFocusIdx, setActiveFocusIdx] = useState(0);
  const activeFocusIdxRef = useRef(0);
  const interactiveRunIndicesRef = useRef(interactiveRunIndices);
  const spanRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  // Keep refs in sync
  useEffect(() => {
    interactiveRunIndicesRef.current = interactiveRunIndices;
  }, [interactiveRunIndices]);

  // Reset focus to first run when chunks change
  useEffect(() => {
    activeFocusIdxRef.current = 0;
    setActiveFocusIdx(0);
  }, [runs]);

  const moveFocus = useCallback((next: number) => {
    activeFocusIdxRef.current = next;
    setActiveFocusIdx(next);
    const runIdx = interactiveRunIndicesRef.current[next];
    if (runIdx !== undefined) {
      const el = spanRefs.current.get(runIdx);
      if (el) {
        el.focus({ preventScroll: true });
        el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const count = interactiveRunIndicesRef.current.length;
      if (count === 0) return;
      const cur = activeFocusIdxRef.current;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveFocus(Math.min(cur + 1, count - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveFocus(Math.max(cur - 1, 0));
      } else if (e.key === 'Home') {
        e.preventDefault();
        moveFocus(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        moveFocus(count - 1);
      }
    },
    [moveFocus],
  );

  if (source.length === 0) {
    return (
      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
          textAlign: 'center',
          padding: 'var(--space-8) 0',
        }}
      >
        Enter text in the source pane to visualise chunks.
      </p>
    );
  }

  let interactiveCursor = -1;

  return (
    <div
      role="region"
      aria-label="Chunk visualisation"
      onKeyDown={handleKeyDown}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        lineHeight: '1.75',
        letterSpacing: '0.01em',
        color: 'var(--text-primary)',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      }}
    >
      {runs.map((run, runIdx) => {
        const text = source.slice(run.start, run.end);

        if (run.kind === 'gap') {
          return (
            <span key={runIdx} aria-hidden="true" style={{ color: 'var(--gap-text)' }}>
              {text}
            </span>
          );
        }

        interactiveCursor++;
        const myInteractiveIdx = interactiveCursor;
        const isFocused = myInteractiveIdx === activeFocusIdx;
        const isOverlap = run.kind === 'overlap';
        const colorIdx = run.colorIndex;

        const label =
          run.kind === 'chunk'
            ? `Chunk ${String(run.chunkIndex + 1)} of ${String(chunks.length)}: ${text.slice(0, 80)}`
            : `Overlap region: ${text.slice(0, 80)}`;

        return (
          <span
            key={runIdx}
            ref={(el) => {
              if (el !== null) {
                spanRefs.current.set(runIdx, el);
              } else {
                spanRefs.current.delete(runIdx);
              }
            }}
            tabIndex={isFocused ? 0 : -1}
            aria-label={label}
            onFocus={() => {
              activeFocusIdxRef.current = myInteractiveIdx;
              setActiveFocusIdx(myInteractiveIdx);
            }}
            style={{
              backgroundColor: `var(--chunk-${String(colorIdx)}-wash)`,
              backgroundImage: isOverlap
                ? `repeating-linear-gradient(45deg, transparent, transparent 4px, var(--overlap-hatch) 4px, var(--overlap-hatch) 8px)`
                : undefined,
              borderRadius: '2px',
              boxShadow: isFocused ? 'var(--focus-ring)' : 'none',
              cursor: 'default',
            }}
          >
            {text}
          </span>
        );
      })}
    </div>
  );
}
