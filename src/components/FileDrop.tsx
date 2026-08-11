import { useRef, useState, useCallback } from 'react';

const MAX_BYTES = 1_000_000; // 1 MB

interface FileDropProps {
  onLoad: (text: string) => void;
}

export function FileDrop({ onLoad }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      if (!file.name.endsWith('.txt')) {
        setError('Only .txt files are supported.');
        return;
      }
      if (file.size > MAX_BYTES) {
        const mb = (file.size / 1_000_000).toFixed(1);
        setError(`File too large — maximum is 1 MB (this file is ${mb} MB).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          onLoad(result);
        }
      };
      reader.readAsText(file);
    },
    [onLoad],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = '';
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        alignItems: 'flex-end',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt"
        aria-hidden="true"
        tabIndex={-1}
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
      <button
        type="button"
        onClick={() => {
          inputRef.current?.click();
        }}
        aria-label="Upload a .txt file"
        style={{
          padding: '3px 10px',
          background: isDragOver ? 'var(--accent-muted)' : 'var(--surface-overlay)',
          color: isDragOver ? 'var(--accent-base)' : 'var(--text-secondary)',
          border: `1px solid ${isDragOver ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s, color 0.15s, border-color 0.15s',
        }}
      >
        {isDragOver ? 'Drop to load' : 'Upload .txt'}
      </button>
      {error !== null && (
        <p
          role="alert"
          style={{
            fontSize: '11px',
            color: 'var(--status-error-text)',
            background: 'var(--status-error-bg)',
            border: '1px solid var(--status-error-text)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px 8px',
            maxWidth: '200px',
            textAlign: 'right',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
