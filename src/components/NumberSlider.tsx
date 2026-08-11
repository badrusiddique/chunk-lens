import * as Slider from '@radix-ui/react-slider';
import type { ChangeEvent } from 'react';

interface Props {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}

export function NumberSlider({ id, label, value, min, max, step = 1, onChange }: Props) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const n = parseInt(e.target.value, 10);
    if (!isNaN(n)) onChange(clamp(n));
  };

  const handleSliderChange = (vals: number[]) => {
    const v = vals[0];
    if (v !== undefined) onChange(v);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-2)',
        }}
      >
        <label
          htmlFor={`${id}-input`}
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </label>
        <input
          id={`${id}-input`}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={handleInputChange}
          style={{
            width: '68px',
            padding: 'var(--space-1) var(--space-2)',
            background: 'var(--surface-overlay)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            textAlign: 'right',
          }}
        />
      </div>

      <Slider.Root
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleSliderChange}
        aria-label={label}
        style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '20px' }}
      >
        <Slider.Track
          style={{
            background: 'var(--border-default)',
            position: 'relative',
            flexGrow: 1,
            borderRadius: '9999px',
            height: '3px',
          }}
        >
          <Slider.Range
            style={{
              position: 'absolute',
              background: 'var(--accent-base)',
              borderRadius: '9999px',
              height: '100%',
            }}
          />
        </Slider.Track>
        <Slider.Thumb
          style={{
            display: 'block',
            width: '14px',
            height: '14px',
            background: 'var(--accent-base)',
            borderRadius: '50%',
            cursor: 'grab',
            outline: 'none',
          }}
        />
      </Slider.Root>
    </div>
  );
}
