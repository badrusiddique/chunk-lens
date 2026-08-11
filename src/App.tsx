import { AppShell } from './components/AppShell';
import { Header } from './components/Header';
import { SourcePane } from './components/SourcePane';
import { useSourceText } from './hooks/useSourceText';

export function App() {
  const [source, setSource] = useSourceText();

  return (
    <AppShell
      header={<Header />}
      inputPane={<SourcePane value={source} onChange={setSource} />}
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
