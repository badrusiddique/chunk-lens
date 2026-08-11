import { AppShell } from './components/AppShell';
import { Header } from './components/Header';
import { ParamPanel } from './components/ParamPanel';
import { SourcePane } from './components/SourcePane';
import { useChunker } from './hooks/useChunker';
import { useSourceText } from './hooks/useSourceText';

export function App() {
  const [source, setSource] = useSourceText();
  const {
    splitterId,
    chunkSize,
    chunkOverlap,
    chunks,
    isBudgetExceeded,
    setSplitterId,
    setChunkSize,
    setChunkOverlap,
  } = useChunker(source);

  return (
    <AppShell
      header={<Header />}
      inputPane={<SourcePane value={source} onChange={setSource} />}
      controlPane={
        <ParamPanel
          splitterId={splitterId}
          chunkSize={chunkSize}
          chunkOverlap={chunkOverlap}
          chunkCount={chunks.length}
          onSplitterChange={setSplitterId}
          onChunkSizeChange={setChunkSize}
          onChunkOverlapChange={setChunkOverlap}
        />
      }
      outputPane={
        <div
          style={{
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            height: '200px',
          }}
        >
          {isBudgetExceeded && (
            <span style={{ color: 'var(--status-warning-text)', fontSize: '12px' }}>
              Showing first 2,000 of {chunks.length}+ chunks
            </span>
          )}
          <span>Chunk canvas coming in feat/chunk-canvas</span>
        </div>
      }
    />
  );
}
