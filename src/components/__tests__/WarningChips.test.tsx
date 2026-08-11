import { render, screen } from '@testing-library/react';
import { WarningChips } from '../WarningChips';
import type { ChunkStats } from '@/lib/stats';

function makeStats(overrides: Partial<ChunkStats> = {}): ChunkStats {
  return {
    inputChars: 100,
    emittedChars: 0,
    uniqueChars: 0,
    duplicatedChars: 0,
    ...overrides,
  };
}

describe('WarningChips', () => {
  it('renders nothing when there are no warnings', () => {
    const { container } = render(
      <WarningChips
        stats={makeStats({ emittedChars: 100, uniqueChars: 100, duplicatedChars: 0 })}
        source="hello world"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows a no-chunks warning when source is non-empty but emitted is 0', () => {
    render(<WarningChips stats={makeStats()} source="hello world" />);
    expect(screen.getByText(/no chunks produced/i)).toBeInTheDocument();
  });

  it('does not show no-chunks warning when source is empty', () => {
    render(<WarningChips stats={makeStats()} source="" />);
    expect(screen.queryByText(/no chunks produced/i)).not.toBeInTheDocument();
  });

  it('shows high-duplication warning when duplicated/emitted > 50%', () => {
    render(
      <WarningChips
        stats={makeStats({ emittedChars: 100, uniqueChars: 40, duplicatedChars: 60 })}
        source="hello world"
      />,
    );
    expect(screen.getByText(/high duplication/i)).toBeInTheDocument();
  });

  it('does not show high-duplication warning when ratio <= 50%', () => {
    render(
      <WarningChips
        stats={makeStats({ emittedChars: 100, uniqueChars: 55, duplicatedChars: 45 })}
        source="hello world"
      />,
    );
    expect(screen.queryByText(/high duplication/i)).not.toBeInTheDocument();
  });

  it('shows the duplication percentage in the warning message', () => {
    render(
      <WarningChips
        stats={makeStats({ emittedChars: 100, uniqueChars: 30, duplicatedChars: 70 })}
        source="hello world"
      />,
    );
    expect(screen.getByText(/70%/)).toBeInTheDocument();
  });
});
