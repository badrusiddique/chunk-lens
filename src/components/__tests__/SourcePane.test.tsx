import { render, screen, fireEvent } from '@testing-library/react';
import { SourcePane } from '../SourcePane';
import { SAMPLES } from '@/samples';

describe('SourcePane', () => {
  it('renders textarea with the provided value', () => {
    render(<SourcePane value="hello world" onChange={() => undefined} />);
    expect(screen.getByRole('textbox')).toHaveValue('hello world');
  });

  it('calls onChange when the user types', () => {
    const onChange = vi.fn();
    render(<SourcePane value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'typed text' } });
    expect(onChange).toHaveBeenCalledWith('typed text');
  });

  it('shows a character count for the current value', () => {
    render(<SourcePane value="hello" onChange={() => undefined} />);
    expect(screen.getByText('5 characters')).toBeInTheDocument();
  });

  it('counts Unicode code points, not UTF-16 code units', () => {
    render(<SourcePane value="🎉🎉" onChange={() => undefined} />);
    expect(screen.getByText('2 characters')).toBeInTheDocument();
  });

  it('renders a chip for every sample', () => {
    render(<SourcePane value="" onChange={() => undefined} />);
    for (const sample of SAMPLES) {
      expect(screen.getByRole('button', { name: sample.label })).toBeInTheDocument();
    }
  });

  it('calls onChange with sample text when a chip is clicked', () => {
    const onChange = vi.fn();
    render(<SourcePane value="" onChange={onChange} />);
    const target = SAMPLES[1];
    if (!target) throw new Error('SAMPLES[1] missing');
    fireEvent.click(screen.getByRole('button', { name: target.label }));
    expect(onChange).toHaveBeenCalledWith(target.text);
  });

  it('marks the chip as pressed when value matches a sample', () => {
    const sample = SAMPLES[0];
    if (!sample) throw new Error('SAMPLES[0] missing');
    render(<SourcePane value={sample.text} onChange={() => undefined} />);
    expect(screen.getByRole('button', { name: sample.label })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
