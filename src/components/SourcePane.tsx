import { FileDrop } from './FileDrop';
import { SampleChips } from './SampleChips';
import { SAMPLES } from '@/samples';

const SEGMENTER = new Intl.Segmenter();

interface SourcePaneProps {
  value: string;
  onChange: (text: string) => void;
}

export function SourcePane({ value, onChange }: SourcePaneProps) {
  const charCount = [...SEGMENTER.segment(value)].length;

  const activeId = SAMPLES.find((s) => s.text === value)?.id;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-6) var(--space-3)',
          flexShrink: 0,
        }}
      >
        <label
          htmlFor="source-textarea"
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
        >
          Source text
        </label>
        <FileDrop onLoad={onChange} />
      </div>

      {/* Sample chips */}
      <div
        style={{
          padding: '0 var(--space-6) var(--space-3)',
          flexShrink: 0,
        }}
      >
        <SampleChips onSelect={onChange} activeId={activeId} />
      </div>

      {/* Textarea */}
      <div
        style={{
          flex: 1,
          padding: '0 var(--space-6)',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <textarea
          id="source-textarea"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          spellCheck={false}
          aria-label="Source text to chunk"
          placeholder="Paste or type text here, or upload a .txt file…"
          style={{
            flex: 1,
            resize: 'none',
            background: 'var(--surface-raised)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: '1.6',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Character counter */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          padding: 'var(--space-2) var(--space-6) var(--space-4)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          flexShrink: 0,
        }}
      >
        {charCount.toLocaleString()} characters
      </div>
    </div>
  );
}
