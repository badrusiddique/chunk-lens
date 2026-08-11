import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileDrop } from '../FileDrop';

describe('FileDrop', () => {
  it('renders the upload button', () => {
    render(<FileDrop onLoad={() => undefined} />);
    expect(screen.getByRole('button', { name: /upload a \.txt file/i })).toBeInTheDocument();
  });

  it('shows an error for non-.txt files', () => {
    render(<FileDrop onLoad={() => undefined} />);
    const input = document.querySelector('input[type="file"]');
    if (!input) throw new Error('file input not found');
    const file = new File(['content'], 'image.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByRole('alert')).toHaveTextContent('Only .txt files are supported.');
  });

  it('shows an error for files larger than 1 MB', () => {
    render(<FileDrop onLoad={() => undefined} />);
    const input = document.querySelector('input[type="file"]');
    if (!input) throw new Error('file input not found');
    const bigContent = 'x'.repeat(1_000_001);
    const file = new File([bigContent], 'big.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByRole('alert')).toHaveTextContent(/too large/i);
  });

  it('calls onLoad with file text for a valid .txt file', async () => {
    const onLoad = vi.fn();
    render(<FileDrop onLoad={onLoad} />);
    const input = document.querySelector('input[type="file"]');
    if (!input) throw new Error('file input not found');
    const file = new File(['hello chunk-lens'], 'sample.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(onLoad).toHaveBeenCalledWith('hello chunk-lens');
    });
  });
});
