import { useMemo } from 'react';
import { AppShell } from './components/AppShell';
import { ChunkCanvas } from './components/ChunkCanvas';
import { ChunkTable } from './components/ChunkTable';
import { Header } from './components/Header';
import { ParamPanel } from './components/ParamPanel';
import { RenderBudgetNotice } from './components/RenderBudgetNotice';
import { SourcePane } from './components/SourcePane';
import { StatTiles } from './components/StatTiles';
import { WarningChips } from './components/WarningChips';
import { useChunker } from './hooks/useChunker';
import { useSourceText } from './hooks/useSourceText';
import { computeStats } from './lib/stats';

export function App() {
  const [source, setSource] = useSourceText();
  const {
    splitterId,
    chunkSize,
    chunkOverlap,
    chunks,
    allChunks,
    isBudgetExceeded,
    setSplitterId,
    setChunkSize,
    setChunkOverlap,
  } = useChunker(source);

  const stats = useMemo(() => computeStats(source, allChunks), [source, allChunks]);

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
          <StatTiles stats={stats} />
          <WarningChips stats={stats} source={source} />
          {isBudgetExceeded && <RenderBudgetNotice totalChunks={allChunks.length} />}
          <ChunkCanvas source={source} chunks={chunks} />
          <ChunkTable source={source} chunks={chunks} />
        </>
      }
    />
  );
}
