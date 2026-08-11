import { SAMPLES, type SampleId } from '@/samples';

interface SampleChipsProps {
  onSelect: (text: string) => void;
  activeId: SampleId | undefined;
}

export function SampleChips({ onSelect, activeId }: SampleChipsProps) {
  return (
    <div
      role="group"
      aria-label="Load a sample document"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}
    >
      {SAMPLES.map((sample) => {
        const isActive = sample.id === activeId;
        return (
          <button
            key={sample.id}
            type="button"
            onClick={() => {
              onSelect(sample.text);
            }}
            aria-pressed={isActive}
            title={sample.description}
            style={{
              padding: '2px 8px',
              background: isActive ? 'var(--accent-muted)' : 'var(--surface-overlay)',
              color: isActive ? 'var(--accent-base)' : 'var(--text-muted)',
              border: `1px solid ${isActive ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'background 0.12s, color 0.12s, border-color 0.12s',
            }}
          >
            {sample.label}
          </button>
        );
      })}
    </div>
  );
}
