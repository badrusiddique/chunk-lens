import * as Select from '@radix-ui/react-select';
import { REGISTRY } from '@/lib/splitters/registry';
import type { SplitterId } from '@/lib/splitters/types';

interface Props {
  value: SplitterId;
  onValueChange: (v: SplitterId) => void;
}

function isSplitterId(v: string): v is SplitterId {
  return REGISTRY.some((m) => m.id === v);
}

export function StrategySelect({ value, onValueChange }: Props) {
  return (
    <Select.Root
      value={value}
      onValueChange={(v) => {
        if (isSplitterId(v)) onValueChange(v);
      }}
    >
      <Select.Trigger
        aria-label="Chunking strategy"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          background: 'var(--surface-overlay)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          width: '100%',
          minWidth: '180px',
        }}
      >
        <Select.Value />
        <Select.Icon style={{ color: 'var(--text-muted)', fontSize: '10px', flexShrink: 0 }}>
          ▾
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          style={{
            background: 'var(--surface-overlay)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 200,
            width: 'var(--radix-select-trigger-width)',
            maxHeight: 'var(--radix-select-content-available-height)',
            overflow: 'hidden',
          }}
        >
          <Select.Viewport style={{ padding: 'var(--space-1)' }}>
            {REGISTRY.map((meta) => (
              <Select.Item
                key={meta.id}
                value={meta.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  outline: 'none',
                  userSelect: 'none',
                }}
              >
                <Select.ItemText>{meta.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
