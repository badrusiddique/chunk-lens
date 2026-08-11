# ADR 001: Phase 1 "Parity" design

- **Status:** proposed, awaiting review
- **Date:** 2026-08-10
- **Scope:** everything shipping in v0.1.0
- **Supersedes:** nothing

Phase 1 delivers every ChunkViz capability, correctly, deployed and usable. This document fixes the
interfaces and acceptance criteria before any code is written. Nothing here is implemented yet.

---

## 1. The load-bearing decision: chunk positions index the source

Every other design choice follows from this one.

> A chunk's `start` and `end` are indices into the **original source string**. Splitters narrow
> ranges; they never fabricate positions.

This is what makes ChunkViz's core visual model possible. The canvas renders the source text **once**
and colours runs of it, rather than printing a list of chunks. That only works if every chunk can be
located in the source. It also means:

- overlap is a genuine interval intersection, so it can be rendered once rather than duplicated
- whitespace trimmed by a strategy becomes a _measurable gap_, not unexplained text jumping
- `coverage` is computable, which is how we replace ChunkViz's misleading `Total Characters`

The one strategy that needs synthesized text (Markdown header, which prepends a heading breadcrumb)
carries it in a separate `prefix` field so positions stay honest.

## 2. The second decision: measurement is injected, not imported

Splitters must size chunks in characters **or** tokens. Loading a BPE encoder is asynchronous and
weighs a couple of megabytes. If splitters imported the tokenizer, `src/lib` would become async and
untestable without loading rank data.

Instead:

```ts
/** Length of `text` in whatever unit the caller is working in. Always synchronous. */
export type Measure = (text: string) => number;
```

The app resolves the encoder once, then hands splitters a synchronous closure. Consequences worth
stating:

- `src/lib/splitters` stays **pure and synchronous**, so every test is a plain function call
- the token-window strategy is fully unit-testable in Phase 1 with a deterministic fake measure, and
  gets wired to real `js-tiktoken` ranks in Phase 2 with no change to the splitter
- swapping tokenizers later touches one module

## 3. Core types

`src/lib/splitters/types.ts`. All readonly, because nothing downstream should mutate a split result.

```ts
export type SplitterId =
  | 'fixed-window'
  | 'recursive-text'
  | 'recursive-javascript'
  | 'recursive-python'
  | 'recursive-markdown'
  | 'sentence'
  | 'markdown-header'
  | 'token-window';

export type SizeUnit = 'characters' | 'tokens';

/** One chunk. `start`/`end` are indices into the source string; `end` is exclusive. */
export interface Chunk {
  readonly index: number; // 0-based, stable ordering
  readonly start: number; // inclusive index into source
  readonly end: number; // exclusive index into source
  readonly size: number; // measured length in the active unit
  /** Text synthesized by the strategy and absent from the source at this position. */
  readonly prefix?: string; // Markdown header breadcrumb only
}

export type WarningCode =
  | 'empty-input'
  | 'overlap-clamped'
  | 'oversize-chunk' // an indivisible atom exceeds chunkSize
  | 'whitespace-trimmed' // strategy dropped source text; coverage < 1
  | 'no-separator-match'; // ladder exhausted, fell through to character splitting

export interface SplitWarning {
  readonly code: WarningCode;
  readonly message: string; // written for a developer, states the consequence
  readonly chunkIndices?: readonly number[];
}

export interface SplitConfig {
  readonly splitter: SplitterId;
  readonly chunkSize: number;
  readonly chunkOverlap: number;
  readonly unit: SizeUnit;
}

/** Config after clamping. Echoed back so a result is reproducible from its own record. */
export type ResolvedConfig = SplitConfig;

export interface SplitResult {
  readonly chunks: readonly Chunk[];
  readonly warnings: readonly SplitWarning[];
  readonly config: ResolvedConfig;
}

export type Splitter = (source: string, config: ResolvedConfig, measure: Measure) => SplitResult;
```

### Registry

`src/lib/splitters/registry.ts` is the single source of truth. The UI never hardcodes a strategy list.

```ts
export interface SplitterMeta {
  readonly id: SplitterId;
  readonly name: string; // "Recursive (Markdown-aware)" — ours, not LangChain's label
  readonly summary: string; // one line, shown in the select and the glossary
  readonly equivalents: { readonly langchain?: string; readonly llamaIndex?: string };
  readonly supports: {
    readonly overlap: boolean; // true for all 8; the field exists for future strategies
    readonly units: readonly SizeUnit[];
  };
  readonly suggestedSample: SampleId;
  readonly split: Splitter;
}
```

Adding a strategy means adding one registry entry. That is the extension point for semantic chunking
in a later version.

## 4. Render runs: the sweep that drives the canvas

`src/lib/segments.ts` turns chunks into paintable runs. Pure interval arithmetic, no React.

```ts
export type RunKind = 'chunk' | 'overlap' | 'gap';

export interface RenderRun {
  readonly start: number;
  readonly end: number;
  readonly kind: RunKind;
  readonly chunkIndices: readonly number[]; // 1 for 'chunk', 2+ for 'overlap', 0 for 'gap'
}

export function toRenderRuns(source: string, chunks: readonly Chunk[]): readonly RenderRun[];
```

Algorithm: collect every boundary, sort, sweep left to right, and count how many chunk intervals
cover each span. Zero coverage is a `gap`, one is a `chunk`, two or more is an `overlap`.

`gap` is a deliberate improvement. ChunkViz drops trimmed whitespace and the text visibly jumps with
only a footnote to explain it. We render gaps as unhighlighted source and count them, so the jumping
becomes a number instead of a mystery.

## 5. Stats: replacing the number ChunkViz gets wrong

`src/lib/stats.ts`.

```ts
export interface SizeSummary {
  readonly min: number;
  readonly median: number;
  readonly mean: number;
  readonly p95: number;
  readonly max: number;
}

export interface ChunkStats {
  readonly count: number;
  readonly inputCharacters: number; // source.length
  readonly emittedCharacters: number; // sum of chunk lengths, duplication included
  readonly uniqueCharacters: number; // source characters covered by >= 1 chunk
  readonly duplicatedCharacters: number; // emitted - unique
  readonly coverage: number; // unique / input, 0..1
  readonly duplication: number; // duplicated / emitted, 0..1
  readonly size: SizeSummary; // in the active unit
  readonly histogram: readonly HistogramBin[];
}
```

Worked against the exact case ChunkViz reports incorrectly. Fixed window, 2,658-char source, size 200,
overlap 50, so stride 150:

| Figure               | Value  | Derivation                     |
| -------------------- | ------ | ------------------------------ |
| chunks               | 18     | `ceil((2658 - 200) / 150) + 1` |
| inputCharacters      | 2,658  | source length                  |
| emittedCharacters    | 3,508  | `17 x 200 + 108`               |
| uniqueCharacters     | 2,658  | fixed window trims nothing     |
| duplicatedCharacters | 850    | 3,508 - 2,658                  |
| coverage             | 1.00   | 2,658 / 2,658                  |
| duplication          | 0.2423 | 850 / 3,508                    |

ChunkViz reports this as `Total Characters: 3508` and nothing else, which reads as "your document is
3,508 characters long". It is 2,658. Both numbers are useful and they are different things, so we
label all four. This table becomes a unit-test fixture verbatim.

Histogram binning: Sturges (`ceil(log2(n)) + 1`) clamped to `[8, 24]` bins, edges snapped to round
numbers. Deterministic, so it can be golden-tested.

## 6. Splitter contracts

Each is specified as behaviour, then implemented test-first from this spec. I have deliberately not
read ChunkViz's source, so these come from the documented semantics of the standard algorithms.

### 6.1 `fixed-window`

Slice at `stride = max(1, chunkSize - chunkOverlap)` from index 0. Boundaries snap **inward** to the
nearest grapheme boundary via `Intl.Segmenter(undefined, { granularity: 'grapheme' })`.

Grapheme snapping is an intentional divergence from a naive implementation. A raw slice can split a
surrogate pair or a ZWJ emoji sequence and emit broken text, and shipping mojibake is not parity worth
having. Snapping inward means `chunkSize` is never exceeded. A single grapheme longer than `chunkSize`
is emitted whole and raises `oversize-chunk`.

### 6.2 `recursive-*` (4 strategies, one engine)

`recursive.ts` is the engine; `separators.ts` holds four ladders. Behaviour:

1. Try the first separator. Split on it.
2. Any piece that still measures over `chunkSize` recurses with the next separator down.
3. The last rung is `''`, which falls back to character splitting.
4. Adjacent pieces are then merged greedily while the merged size stays within `chunkSize`.
5. If `chunkOverlap > 0`, each chunk's `start` is pulled back so it re-covers roughly `chunkOverlap`
   units of its predecessor, snapped to a boundary from the ladder rung actually used.
6. Leading and trailing whitespace on each chunk is trimmed, and `whitespace-trimmed` is raised once
   with the resulting `coverage`.

Ladders (`separators.ts`):

| Strategy               | Ladder                                                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `recursive-text`       | `\n\n`, `\n`, ` `, `''`                                                                                                                   |
| `recursive-javascript` | `\nclass `, `\nfunction `, `\nconst `, `\nlet `, `\nvar `, `\nif `, `\nfor `, `\nwhile `, `\nswitch `, `\ncase `, `\n\n`, `\n`, ` `, `''` |
| `recursive-python`     | `\nclass `, `\ndef `, `\n\tdef `, `\n\n`, `\n`, ` `, `''`                                                                                 |
| `recursive-markdown`   | `\n## `, `\n### `, `\n#### `, `\n##### `, `\n###### `, ` ```\n `, `\n---\n`, `\n___\n`, `\n\n`, `\n`, ` `, `''`                           |

**Overlap is enabled on all four.** ChunkViz disables it, which is an implementation limitation rather
than a property of the algorithm.

### 6.3 `sentence`

Segment with `Intl.Segmenter(undefined, { granularity: 'sentence' })`, then pack sentences greedily up
to `chunkSize`. A sentence longer than `chunkSize` is emitted alone with `oversize-chunk`. Overlap is
whole trailing sentences, never a partial one, because half a sentence defeats the point of the
strategy.

`Intl.Segmenter` is available in Node 22 and every target browser, so there is no polyfill.

### 6.4 `markdown-header`

Parse ATX headings (`#` through `######`), maintain a heading stack, and cut at every heading. Each
chunk gets a `prefix` holding its breadcrumb, for example `# Guide > ## Installation\n\n`. A section
larger than `chunkSize` is subdivided by the `recursive-markdown` engine with the breadcrumb repeated
on each part, which is the behaviour that makes header splitting useful for retrieval. `prefix` counts
toward `emittedCharacters` but not toward `uniqueCharacters`, because it is not source text.

### 6.5 `token-window`

`fixed-window` in token space: encode, window over token ids at `stride`, map back to character
offsets. In Phase 1 it is tested with a deterministic fake measure; Phase 2 supplies real ranks.

## 7. Component contracts

| Component            | Responsibility                                                                       | Key props                                             |
| -------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `AppShell`           | Three-region workbench grid, skip link, landmarks                                    | `children`                                            |
| `SourcePane`         | Textarea, autosave, character counter, size guard                                    | `value`, `onChange`, `maxBytes`                       |
| `FileDrop`           | `.txt` picker plus drop zone, rejects non-text, announces result                     | `onLoad(text, filename)`                              |
| `SampleChip`         | Offers a matching sample when strategy and content disagree. **Never auto-applies.** | `suggested`, `onApply`, `onDismiss`                   |
| `StrategySelect`     | Registry-driven, groups recursive variants, shows the one-line summary               | `value`, `onChange`                                   |
| `NumberSlider`       | Coupled number + range, shared label, clamps, presets                                | `label`, `value`, `min`, `max`, `presets`, `onChange` |
| `ParamPanel`         | Composes the controls from the strategy's param schema                               | `config`, `meta`, `onChange`                          |
| `ChunkCanvas`        | Renders source once, paints runs, roving tabindex, budget notice                     | `source`, `runs`, `budget`, `onSelect`                |
| `ChunkRun`           | One run: wash + accent for `chunk`, wash + hatch for `overlap`, bare for `gap`       | `run`, `text`, `selected`                             |
| `Legend`             | Live examples of chunk, overlap and gap treatments                                   | `-`                                                   |
| `RenderBudgetNotice` | States the exact rendered range and offers navigation                                | `shown`, `total`, `onJump`                            |
| `ChunkTable`         | Accessible non-visual equivalent: index, range, size, preview                        | `chunks`, `source`                                    |
| `StatTiles`          | The four labelled figures plus count and mean                                        | `stats`                                               |
| `WarningChips`       | One chip per `SplitWarning`, with its consequence spelled out                        | `warnings`                                            |

`ChunkCanvas` accessibility: the canvas is a `role="group"` with a screen-reader summary. Runs carry
`data-chunk-index` and participate in a roving tabindex, so arrow keys move between chunks, Enter
selects, and Home/End jump to the ends. `ChunkTable` is a sibling tab, so nothing depends on colour or
on sighted scanning.

## 8. Acceptance criteria

Every criterion below becomes a named test. Nothing merges without its criteria green.

**`chore/scaffold`**

- `pnpm verify` passes on the empty app: typecheck, lint at zero warnings, tests, build, prerender
- CI runs on push and PR on Node 22 and is required for merge
- Light and dark tokens defined; the palette validator runs in CI against our real surfaces
- An error boundary catches a thrown render and shows a recovery affordance, proven by a test

**`feat/source-input`**

- Typing persists across reload
- Upload and drag-drop both load a `.txt`; a non-text file is rejected with a readable message
- A file over the guard is refused without freezing the tab
- Five sample documents exist, all authored by us, verified free of third-party prose
- Zero axe critical or serious violations; the textarea has a real associated `<label>`

**`feat/splitters`**

- All 8 strategies produce chunks satisfying every invariant in section 9
- Golden files pin each strategy's output on each sample document
- 90% statements and branches on `src/lib/splitters`
- 1 MB source splits in under 250ms for every strategy, asserted in the test

**`feat/strategy-and-params`**

- Changing strategy **preserves the text**; the sample chip is offered and never auto-applies
- Number and slider stay in sync in both directions
- Overlap clamps at 90% of chunk size; above 50% a warning states the duplication cost
- Presets set exact values; every control is reachable and operable by keyboard alone

**`feat/chunk-canvas`**

- The source renders once; concatenating all run texts reproduces the source exactly
- Overlap runs appear once, carry the hatch, and list 2+ chunk indices
- Gap runs are visible and counted
- Adjacent runs never share a palette slot
- The budget notice states the exact rendered range when chunk count exceeds the budget
- Arrow keys traverse every run, focus is visible, Enter selects, `ChunkTable` lists every chunk

**`feat/basic-stats`**

- The section 5 table reproduces exactly for the 2,658 / 200 / 50 case
- `coverage < 1` exactly when a strategy trimmed, and the warning chip appears
- Figures are labelled so `input` and `emitted` can never be confused

## 9. Invariants, asserted for every strategy over generated inputs

1. Chunks are ordered by `start`, and every chunk has `start < end`
2. `0 <= start` and `end <= source.length`
3. No chunk is empty after trimming
4. Union of chunk ranges, concatenated, equals the source minus declared trim loss, and trim loss is
   always reported as `whitespace-trimmed` rather than being silent
5. `size <= chunkSize` unless a single indivisible atom exceeds it, in which case `oversize-chunk`
   names that chunk
6. With `chunkOverlap = 0`, no two chunk ranges intersect
7. With `chunkOverlap > 0`, consecutive chunks intersect and non-consecutive ones do not
8. `emittedCharacters === sum(end - start) + sum(prefix.length)`
9. Splitting is deterministic: same input and config produce identical output
10. No chunk boundary falls inside a grapheme cluster

Edge cases in the suite: empty string, one character, source shorter than `chunkSize`, exact multiple,
`chunkSize = 1`, `chunkOverlap = chunkSize - 1`, `chunkOverlap > chunkSize` (clamped), CRLF versus LF,
tabs, ZWJ emoji, combining marks, CJK, a document with no separator matches, and 1 MB of text.

## 10. Phase 1 QA plan

Per feature, before the PR opens: acceptance criteria green, edge cases from section 9, keyboard-only
pass, screen-reader spot check, viewports 375 / 768 / 1280 / 1440 / 1920, light and dark, a 1 MB paste,
and `pnpm verify` clean. Result pasted into the PR body.

Release gate for v0.1.0: all 23 rows of the parity matrix green, 90% coverage on `src/lib`, zero axe
critical or serious on every route in both themes, Lighthouse budget met (LCP under 1.5s, CLS under
0.05, initial JS under 150 KB gzipped), deployed to Vercel and verified live.

## 11. Deferred, on purpose

Token counting with real ranks, the distribution histogram, and the chunk inspector are Phase 2.
Export and URL state are Phase 3. Compare view, the doc pages and SEO are Phase 4. Canvas
virtualization is Phase 4 and conditional on the render budget proving limiting. Semantic chunking is
out of v1 entirely, and the registry is the seam that lets it in later.

## 12. Open questions for review

1. **Grapheme snapping on `fixed-window`** (section 6.1) makes chunk sizes differ slightly from a
   naive slice, so our numbers will not always match ChunkViz's to the character on emoji-heavy input.
   I think correct text beats bit-identical parity. Confirm.
2. **Render budget of 2,000 runs** (section 7). At size 25 on the 2,658-char sample that is well
   clear, and it only engages on large inputs. Happy with 2,000, or higher?
3. **Recursive ladders** (section 6.2) are the LangChain sets. They are the de facto standard and
   developers expect them, so I propose keeping them as-is and citing the equivalence rather than
   inventing different ones. Confirm.
