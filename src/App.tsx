import { AppShell } from './components/AppShell';
import { Header } from './components/Header';

export function App() {
  return (
    <AppShell
      header={<Header />}
      inputPane={
        <div
          style={{
            padding: 'var(--space-6)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Source text
            </span>
          </div>
          <textarea
            aria-label="Source text to chunk"
            placeholder="Paste or type text to visualise how it gets chunked…"
            style={{
              flex: 1,
              minHeight: '300px',
              resize: 'none',
              background: 'var(--surface-raised)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              lineHeight: '1.6',
            }}
          />
        </div>
      }
      controlPane={
        <div
          style={{
            padding: 'var(--space-5) var(--space-6)',
            color: 'var(--text-secondary)',
            fontSize: '13px',
          }}
        >
          Controls coming in feat/strategy-and-params
        </div>
      }
      outputPane={
        <div
          style={{
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
          }}
        >
          Chunk canvas coming in feat/chunk-canvas
        </div>
      }
    />
  );
}
