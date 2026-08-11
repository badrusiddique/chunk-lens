import { render, screen, fireEvent } from '@testing-library/react';
import { NumberSlider } from '../NumberSlider';

describe('NumberSlider', () => {
  it('renders the label and input', () => {
    render(
      <NumberSlider
        id="test"
        label="Chunk size"
        value={100}
        min={1}
        max={2000}
        onChange={() => undefined}
      />,
    );
    // getByRole('spinbutton') is more specific: avoids matching the Radix Slider's aria-label
    expect(screen.getByRole('spinbutton', { name: 'Chunk size' })).toBeInTheDocument();
  });

  it('displays the current value in the number input', () => {
    render(
      <NumberSlider
        id="test"
        label="Chunk size"
        value={150}
        min={1}
        max={2000}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByRole('spinbutton')).toHaveValue(150);
  });

  it('calls onChange when the number input changes with a valid value', () => {
    const onChange = vi.fn();
    render(
      <NumberSlider
        id="test"
        label="Chunk size"
        value={100}
        min={1}
        max={2000}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '250' } });
    expect(onChange).toHaveBeenCalledWith(250);
  });

  it('does not call onChange when the input value is NaN', () => {
    const onChange = vi.fn();
    render(
      <NumberSlider
        id="test"
        label="Chunk size"
        value={100}
        min={1}
        max={2000}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clamps input values below min up to min', () => {
    const onChange = vi.fn();
    render(
      <NumberSlider
        id="test"
        label="Chunk size"
        value={100}
        min={10}
        max={2000}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } });
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('clamps input values above max down to max', () => {
    const onChange = vi.fn();
    render(
      <NumberSlider
        id="test"
        label="Chunk size"
        value={100}
        min={1}
        max={200}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '9999' } });
    expect(onChange).toHaveBeenCalledWith(200);
  });
});
