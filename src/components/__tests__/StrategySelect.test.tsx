import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrategySelect } from '../StrategySelect';
import { REGISTRY } from '@/lib/splitters/registry';

describe('StrategySelect', () => {
  it('renders a trigger button with accessible label', () => {
    render(<StrategySelect value="fixed-window" onValueChange={() => undefined} />);
    expect(screen.getByRole('combobox', { name: 'Chunking strategy' })).toBeInTheDocument();
  });

  it('displays the label of the currently selected strategy', () => {
    render(<StrategySelect value="sentence" onValueChange={() => undefined} />);
    expect(screen.getByRole('combobox')).toHaveTextContent(
      REGISTRY.find((m) => m.id === 'sentence')?.label ?? '',
    );
  });

  it('opens the dropdown and shows all 8 strategy options', async () => {
    const user = userEvent.setup();
    render(<StrategySelect value="fixed-window" onValueChange={() => undefined} />);
    await user.click(screen.getByRole('combobox'));
    for (const meta of REGISTRY) {
      expect(screen.getByRole('option', { name: meta.label })).toBeInTheDocument();
    }
  });

  it('calls onValueChange with the selected strategy id', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<StrategySelect value="fixed-window" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox'));
    const target = REGISTRY.find((m) => m.id === 'recursive-text');
    if (target === undefined) throw new Error('recursive-text not found in REGISTRY');
    await user.click(screen.getByRole('option', { name: target.label }));
    expect(onValueChange).toHaveBeenCalledWith('recursive-text');
  });
});
