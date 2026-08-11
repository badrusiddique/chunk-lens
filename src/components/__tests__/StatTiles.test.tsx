import { render, screen } from '@testing-library/react';
import { StatTiles } from '../StatTiles';
import type { ChunkStats } from '@/lib/stats';

const stats: ChunkStats = {
  inputChars: 2658,
  emittedChars: 3508,
  uniqueChars: 2600, // different from inputChars to avoid duplicate-text issues
  duplicatedChars: 908,
};

describe('StatTiles', () => {
  it('renders all 4 stat labels', () => {
    render(<StatTiles stats={stats} />);
    expect(screen.getByText('Input')).toBeInTheDocument();
    expect(screen.getByText('Emitted')).toBeInTheDocument();
    expect(screen.getByText('Unique')).toBeInTheDocument();
    expect(screen.getByText('Duplicated')).toBeInTheDocument();
  });

  it('displays formatted numbers for each stat', () => {
    render(<StatTiles stats={stats} />);
    expect(screen.getByText('2,658')).toBeInTheDocument();
    expect(screen.getByText('3,508')).toBeInTheDocument();
    expect(screen.getByText('2,600')).toBeInTheDocument();
    expect(screen.getByText('908')).toBeInTheDocument();
  });

  it('has 4 accessible term elements (one per stat)', () => {
    render(<StatTiles stats={stats} />);
    expect(screen.getAllByRole('term')).toHaveLength(4);
  });

  it('renders hint text for each stat', () => {
    render(<StatTiles stats={stats} />);
    expect(screen.getByText('source characters')).toBeInTheDocument();
    expect(screen.getByText('across all chunks')).toBeInTheDocument();
    expect(screen.getByText('covered positions')).toBeInTheDocument();
    expect(screen.getByText('from overlapping chunks')).toBeInTheDocument();
  });
});
