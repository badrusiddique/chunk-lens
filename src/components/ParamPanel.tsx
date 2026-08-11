import { getSplitter } from '@/lib/splitters/registry';
import type { SplitterId } from '@/lib/splitters/types';
import { NumberSlider } from './NumberSlider';
import { StrategySelect } from './StrategySelect';

interface Props {
  splitterId: SplitterId;
  chunkSize: number;
  chunkOverlap: number;
  chunkCount: number;
  onSplitterChange: (id: SplitterId) => void;
  onChunkSizeChange: (n: number) => void;
  onChunkOverlapChange: (n: number) => void;
}

export function ParamPanel({
  splitterId,
  chunkSize,
  chunkOverlap,
  chunkCount,
  onSplitterChange,
  onChunkSizeChange,
  onChunkOverlapChange,
}: Props) {
  const meta = getSplitter(splitterId);
  const overlapMax = Math.max(0, chunkSize - 1);
  const overlapWarning = chunkOverlap > chunkSize / 2;

  return (
    <div
      style={{
        padding: 'var(--space-5) var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
      }}
    >
      {/* Strategy selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Strategy
        </span>
        <StrategySelect value={splitterId} onValueChange={onSplitterChange} />
        {meta !== undefined && (
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
            }}
          >
            {meta.description}
          </p>
        )}
      </div>

      {/* Chunk size */}
      <NumberSlider
        id="chunk-size"
        label="Chunk size"
        value={chunkSize}
        min={1}
        max={2000}
        onChange={onChunkSizeChange}
      />

      {/* Overlap */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <NumberSlider
          id="chunk-overlap"
          label="Overlap"
          value={chunkOverlap}
          min={0}
          max={overlapMax}
          onChange={onChunkOverlapChange}
        />
        {overlapWarning && (
          <p
            role="status"
            style={{
              margin: 0,
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--status-warning-bg)',
              color: 'var(--status-warning-text)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              lineHeight: '1.4',
            }}
          >
            Overlap &gt; 50% of chunk size — adjacent chunks will share significant content.
          </p>
        )}
      </div>

      {/* Chunk count */}
      <p
        aria-live="polite"
        aria-atomic="true"
        style={{
          margin: 0,
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
        }}
      >
        {chunkCount} {chunkCount === 1 ? 'chunk' : 'chunks'}
      </p>
    </div>
  );
}
