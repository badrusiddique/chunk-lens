import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

function Boom(): never {
  throw new Error('test render error');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress expected console.error from the thrown render
    vi.spyOn(console, 'error').mockImplementation(() => {
      /* suppress */
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children normally when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>healthy content</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('healthy content')).toBeInTheDocument();
  });

  it('catches a thrown render and shows the error message', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('test render error')).toBeInTheDocument();
  });

  it('provides a "Try again" recovery button', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('clears the error state when "Try again" is clicked, allowing a fresh render', () => {
    // Use a ref-controlled component so we can stop it throwing after the reset
    let shouldThrow = true;

    function Conditional() {
      if (shouldThrow) throw new Error('controlled error');
      return <p>recovered</p>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <Conditional />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Stop the child from throwing, then reset the boundary
    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Re-render with the same tree; now Conditional renders without throwing
    rerender(
      <ErrorBoundary>
        <Conditional />
      </ErrorBoundary>,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('recovered')).toBeInTheDocument();
  });
});
