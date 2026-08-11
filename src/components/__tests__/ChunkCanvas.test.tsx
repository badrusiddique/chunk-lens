import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChunkCanvas } from '../ChunkCanvas';

const SRC = 'abcdefghijklmnopqrst'; // 20 chars

describe('ChunkCanvas', () => {
  it('shows a placeholder message when source is empty', () => {
    render(<ChunkCanvas source="" chunks={[]} />);
    expect(screen.getByText(/enter text/i)).toBeInTheDocument();
  });

  it('renders the full source text split across spans', () => {
    render(
      <ChunkCanvas
        source={SRC}
        chunks={[
          { start: 0, end: 10 },
          { start: 10, end: 20 },
        ]}
      />,
    );
    // The text is split across spans; all of it should be in the document
    expect(screen.getByRole('region', { name: /chunk visualis/i })).toBeInTheDocument();
    const region = screen.getByRole('region');
    expect(region.textContent).toBe(SRC);
  });

  it('first interactive span has tabIndex 0, second has -1', () => {
    render(
      <ChunkCanvas
        source={SRC}
        chunks={[
          { start: 0, end: 10 },
          { start: 10, end: 20 },
        ]}
      />,
    );
    const [first, second] = screen
      .getAllByRole('generic', { hidden: false })
      .filter((el) => el.getAttribute('aria-label')?.startsWith('Chunk'));
    if (first === undefined || second === undefined) throw new Error('chunk spans not found');
    expect(first.getAttribute('tabindex')).toBe('0');
    expect(second.getAttribute('tabindex')).toBe('-1');
  });

  it('ArrowRight moves keyboard focus to next chunk span', async () => {
    const user = userEvent.setup();
    render(
      <ChunkCanvas
        source={SRC}
        chunks={[
          { start: 0, end: 10 },
          { start: 10, end: 20 },
        ]}
      />,
    );

    const chunkSpans = screen
      .getAllByRole('generic', { hidden: false })
      .filter((el) => el.getAttribute('aria-label')?.startsWith('Chunk'));
    const first = chunkSpans[0];
    if (first === undefined) throw new Error('no chunk spans');

    await user.tab();
    first.focus();
    await user.keyboard('{ArrowRight}');

    const second = chunkSpans[1];
    if (second === undefined) throw new Error('second chunk span not found');
    expect(document.activeElement).toBe(second);
  });

  it('renders source as a single gap run when chunks array is empty', () => {
    render(<ChunkCanvas source={SRC} chunks={[]} />);
    const region = screen.getByRole('region');
    expect(region.textContent).toBe(SRC);
  });
});
