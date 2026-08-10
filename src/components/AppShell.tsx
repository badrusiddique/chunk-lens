import type { ReactNode } from 'react';

interface Props {
  header: ReactNode;
  inputPane: ReactNode;
  controlPane: ReactNode;
  outputPane: ReactNode;
}

/**
 * Three-region workbench layout:
 *   - A slim header bar with title and theme toggle
 *   - Left column: source input (resizable)
 *   - Right column: controls on top, output canvas below
 */
export function AppShell({ header, inputPane, controlPane, outputPane }: Props) {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="app-header" role="banner">
        {header}
      </header>

      <main id="main-content" className="app-body" role="main">
        <section className="pane pane--input" aria-label="Source text">
          {inputPane}
        </section>

        <div className="pane pane--right">
          <section className="pane pane--controls" aria-label="Chunking configuration">
            {controlPane}
          </section>
          <section className="pane pane--output" aria-label="Chunk visualisation">
            {outputPane}
          </section>
        </div>
      </main>

      <style>{`
        .app-shell {
          display: flex;
          flex-direction: column;
          min-height: 100dvh;
        }

        .app-header {
          display: flex;
          align-items: center;
          height: 48px;
          padding: 0 var(--space-6);
          background: var(--surface-raised);
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .app-body {
          display: grid;
          grid-template-columns: minmax(320px, 40%) 1fr;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .pane {
          overflow: auto;
        }

        .pane--input {
          border-right: 1px solid var(--border-subtle);
          height: calc(100dvh - 48px);
          position: sticky;
          top: 48px;
          display: flex;
          flex-direction: column;
        }

        .pane--right {
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .pane--controls {
          border-bottom: 1px solid var(--border-subtle);
          background: var(--surface-raised);
          flex-shrink: 0;
          overflow: visible;
        }

        .pane--output {
          flex: 1;
          overflow: auto;
          padding: var(--space-6);
        }

        @media (max-width: 768px) {
          .app-body {
            grid-template-columns: 1fr;
          }

          .pane--input {
            height: auto;
            position: static;
            border-right: none;
            border-bottom: 1px solid var(--border-subtle);
          }
        }
      `}</style>
    </div>
  );
}
