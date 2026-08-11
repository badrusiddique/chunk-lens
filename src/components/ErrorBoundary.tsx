import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[chunk-lens] Unhandled render error:', error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100dvh',
            gap: '16px',
            padding: '32px',
            fontFamily: 'var(--font-sans)',
            background: 'var(--surface-base)',
            color: 'var(--text-primary)',
          }}
        >
          <p style={{ color: 'var(--status-error-text)', fontWeight: 600 }}>Something went wrong</p>
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              background: 'var(--surface-raised)',
              padding: '16px',
              borderRadius: '5px',
              maxWidth: '600px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            onClick={() => {
              this.setState({ error: null });
            }}
            style={{
              padding: '8px 20px',
              background: 'var(--accent-base)',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
