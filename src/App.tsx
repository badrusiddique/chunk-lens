import { AppShell } from './components/AppShell';
import { ChunkCanvas } from './components/ChunkCanvas';
import { ChunkTable } from './components/ChunkTable';
import { Header } from './components/Header';
import { ParamPanel } from './components/ParamPanel';
import { RenderBudgetNotice } from './components/RenderBudgetNotice';
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
        <>
          {isBudgetExceeded && <RenderBudgetNotice totalChunks={chunks.length} />}
          <ChunkCanvas source={source} chunks={chunks} />
          <ChunkTable source={source} chunks={chunks} />
        </>
      }
    />
  );
}
