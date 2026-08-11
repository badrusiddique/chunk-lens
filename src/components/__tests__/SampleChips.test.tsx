import { render, screen, fireEvent } from '@testing-library/react';
import { SampleChips } from '../SampleChips';
import { SAMPLES } from '@/samples';

describe('SampleChips', () => {
  it('renders a button for each sample', () => {
    render(<SampleChips onSelect={() => undefined} activeId={undefined} />);
    for (const sample of SAMPLES) {
      expect(screen.getByRole('button', { name: sample.label })).toBeInTheDocument();
    }
  });

  it('calls onSelect with the sample text when a chip is clicked', () => {
    const onSelect = vi.fn();
    render(<SampleChips onSelect={onSelect} activeId={undefined} />);
    const first = SAMPLES[0];
    if (!first) throw new Error('SAMPLES is empty');
    fireEvent.click(screen.getByRole('button', { name: first.label }));
    expect(onSelect).toHaveBeenCalledWith(first.text);
  });

  it('marks the matching chip as pressed', () => {
    const active = SAMPLES[2];
    if (!active) throw new Error('SAMPLES[2] missing');
    render(<SampleChips onSelect={() => undefined} activeId={active.id} />);
    expect(screen.getByRole('button', { name: active.label })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const others = SAMPLES.filter((s) => s.id !== active.id);
    for (const s of others) {
      expect(screen.getByRole('button', { name: s.label })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    }
  });
});
