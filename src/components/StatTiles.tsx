import type { ChunkStats } from '@/lib/stats';

interface TileProps {
  label: string;
  value: number;
  hint: string;
  accent?: boolean;
}

function Tile({ label, value, hint, accent = false }: TileProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--surface-raised)',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${accent ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
      }}
    >
      <dd
        style={{
          margin: 0,
          fontSize: '22px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          lineHeight: 1,
          color: accent ? 'var(--accent-base)' : 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}
      >
        {value.toLocaleString()}
      </dd>
      <dt
        style={{
          margin: 0,
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </dt>
      <span
        style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          lineHeight: '1.4',
        }}
      >
        {hint}
      </span>
    </div>
  );
}

interface Props {
  stats: ChunkStats;
}

export function StatTiles({ stats }: Props) {
  return (
    <dl
      aria-label="Chunk statistics"
      className="stat-tiles"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-3)',
        margin: 0,
        marginBottom: 'var(--space-5)',
      }}
    >
      <Tile label="Input" value={stats.inputChars} hint="source characters" />
      <Tile label="Emitted" value={stats.emittedChars} hint="across all chunks" />
      <Tile label="Unique" value={stats.uniqueChars} hint="covered positions" accent />
      <Tile label="Duplicated" value={stats.duplicatedChars} hint="from overlapping chunks" />
    </dl>
  );
}
