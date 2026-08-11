export type Measure = (text: string) => number;

export interface Chunk {
  readonly start: number;
  readonly end: number;
}

export type SplitterId =
  | 'fixed-window'
  | 'recursive-text'
  | 'recursive-javascript'
  | 'recursive-python'
  | 'recursive-markdown'
  | 'sentence'
  | 'markdown-header'
  | 'token-window';

export interface SplitterOptions {
  readonly chunkSize: number;
  readonly chunkOverlap: number;
  readonly measure: Measure;
}

export type Splitter = (source: string, opts: SplitterOptions) => readonly Chunk[];

export interface SplitterMeta {
  readonly id: SplitterId;
  readonly label: string;
  readonly description: string;
  readonly langEquivalent: string;
  readonly defaultChunkSize: number;
  readonly defaultOverlap: number;
  readonly supportsOverlap: boolean;
  readonly split: Splitter;
}
