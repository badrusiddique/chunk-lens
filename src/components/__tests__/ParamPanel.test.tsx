import { render, screen } from '@testing-library/react';
import { ParamPanel } from '../ParamPanel';
import { getSplitter } from '@/lib/splitters/registry';

const noop = () => undefined;

describe('ParamPanel', () => {
  it('renders a strategy selector', () => {
    render(
      <ParamPanel
        splitterId="fixed-window"
        chunkSize={25}
        chunkOverlap={0}
        chunkCount={10}
        onSplitterChange={noop}
        onChunkSizeChange={noop}
        onChunkOverlapChange={noop}
      />,
    );
    expect(screen.getByRole('combobox', { name: 'Chunking strategy' })).toBeInTheDocument();
  });

  it('renders the strategy description', () => {
    const meta = getSplitter('fixed-window');
    if (meta === undefined) throw new Error('fixed-window missing from REGISTRY');
    render(
      <ParamPanel
        splitterId="fixed-window"
        chunkSize={25}
        chunkOverlap={0}
        chunkCount={0}
        onSplitterChange={noop}
        onChunkSizeChange={noop}
        onChunkOverlapChange={noop}
      />,
    );
    expect(screen.getByText(meta.description)).toBeInTheDocument();
  });

  it('renders chunk size and overlap sliders', () => {
    render(
      <ParamPanel
        splitterId="fixed-window"
        chunkSize={25}
        chunkOverlap={0}
        chunkCount={0}
        onSplitterChange={noop}
        onChunkSizeChange={noop}
        onChunkOverlapChange={noop}
      />,
    );
    expect(screen.getByRole('spinbutton', { name: 'Chunk size' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Overlap' })).toBeInTheDocument();
  });

  it('shows the chunk count with correct singular form', () => {
    render(
      <ParamPanel
        splitterId="fixed-window"
        chunkSize={25}
        chunkOverlap={0}
        chunkCount={1}
        onSplitterChange={noop}
        onChunkSizeChange={noop}
        onChunkOverlapChange={noop}
      />,
    );
    expect(screen.getByText('1 chunk')).toBeInTheDocument();
  });

  it('shows the chunk count with correct plural form', () => {
    render(
      <ParamPanel
        splitterId="fixed-window"
        chunkSize={25}
        chunkOverlap={0}
        chunkCount={42}
        onSplitterChange={noop}
        onChunkSizeChange={noop}
        onChunkOverlapChange={noop}
      />,
    );
    expect(screen.getByText('42 chunks')).toBeInTheDocument();
  });

  it('shows overlap warning when overlap > 50% of chunkSize', () => {
    render(
      <ParamPanel
        splitterId="fixed-window"
        chunkSize={10}
        chunkOverlap={6}
        chunkCount={5}
        onSplitterChange={noop}
        onChunkSizeChange={noop}
        onChunkOverlapChange={noop}
      />,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not show overlap warning when overlap <= 50% of chunkSize', () => {
    render(
      <ParamPanel
        splitterId="fixed-window"
        chunkSize={10}
        chunkOverlap={5}
        chunkCount={5}
        onSplitterChange={noop}
        onChunkSizeChange={noop}
        onChunkOverlapChange={noop}
      />,
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
