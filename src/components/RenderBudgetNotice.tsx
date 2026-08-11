import { RENDER_BUDGET } from '@/hooks/useChunker';

interface Props {
  totalChunks: number;
}

export function RenderBudgetNotice({ totalChunks }: Props) {
  return (
    <p
      role="status"
      aria-live="polite"
      style={{
        margin: 0,
        marginBottom: 'var(--space-4)',
        padding: 'var(--space-2) var(--space-3)',
        background: 'var(--status-warning-bg)',
        color: 'var(--status-warning-text)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
        lineHeight: '1.5',
      }}
    >
      Showing first {RENDER_BUDGET.toLocaleString()} of {totalChunks.toLocaleString()}+ chunks.
      Increase chunk size or reduce overlap to fit within the render limit.
    </p>
  );
}
