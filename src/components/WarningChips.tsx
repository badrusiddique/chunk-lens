import type { ChunkStats } from '@/lib/stats';

interface Props {
  stats: ChunkStats;
  source: string;
}

interface Warning {
  key: string;
  message: string;
}

export function WarningChips({ stats, source }: Props) {
  const warnings: Warning[] = [];

  if (source.length > 0 && stats.emittedChars === 0) {
    warnings.push({
      key: 'no-chunks',
      message: 'No chunks produced — try a smaller chunk size.',
    });
  }

  const duplicationRatio = stats.emittedChars > 0 ? stats.duplicatedChars / stats.emittedChars : 0;
  if (duplicationRatio > 0.5) {
    warnings.push({
      key: 'high-duplication',
      message: `High duplication: ${Math.round(duplicationRatio * 100).toString()}% of emitted characters appear in more than one chunk.`,
    });
  }

  if (warnings.length === 0) return null;

  return (
    <ul
      role="list"
      aria-label="Chunking warnings"
      style={{
        margin: 0,
        marginBottom: 'var(--space-4)',
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
      }}
    >
      {warnings.map((w) => (
        <li
          key={w.key}
          role="status"
          style={{
            padding: 'var(--space-1) var(--space-3)',
            background: 'var(--status-warning-bg)',
            color: 'var(--status-warning-text)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            lineHeight: '1.5',
          }}
        >
          {w.message}
        </li>
      ))}
    </ul>
  );
}
