import type { Chunk } from '@/lib/splitters/types';

interface Props {
  source: string;
  chunks: readonly Chunk[];
}

export function ChunkTable({ source, chunks }: Props) {
  return (
    <div
      // Visually hidden but accessible to screen readers
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      <table>
        <caption>Chunk breakdown — {chunks.length} chunks</caption>
        <thead>
          <tr>
            <th scope="col">Index</th>
            <th scope="col">Start</th>
            <th scope="col">End</th>
            <th scope="col">Length</th>
            <th scope="col">Preview</th>
          </tr>
        </thead>
        <tbody>
          {chunks.map((chunk, i) => {
            const text = source.slice(chunk.start, chunk.end);
            const preview = text.length > 60 ? text.slice(0, 60) + '…' : text;
            return (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{chunk.start}</td>
                <td>{chunk.end}</td>
                <td>{chunk.end - chunk.start}</td>
                <td>{preview}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
