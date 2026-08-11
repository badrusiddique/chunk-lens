# Changelog

All notable changes to chunk-lens are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

_Nothing yet._

---

## [0.1.0] — 2026-08-11

### Added

**Source input**

- Textarea pre-filled with a 2,658-character prose sample about RAG chunking strategies
- `localStorage` autosave of source text (`cl-source` key) — persists across page reloads
- `.txt` upload button (file input); rejects non-`.txt` MIME types with a clear error
- Drag-and-drop `.txt` support (same validation as the upload button)
- Sample chip buttons for 5 original authored documents: prose, TypeScript, Python, Markdown, longform
- Character count displayed below the textarea (grapheme-cluster accurate via `Intl.Segmenter`)

**Splitting strategies**

- 8 strategies implemented as pure TypeScript in `src/lib/splitters/`:
  - `fixed-window` — stride = chunkSize − chunkOverlap; boundaries snap to grapheme clusters
  - `recursive-text` — LangChain `RecursiveCharacterTextSplitter` separator ladder
  - `recursive-javascript`, `recursive-python`, `recursive-markdown` — language-aware ladders
  - `sentence` — `Intl.Segmenter` (granularity: sentence) into greedy merge
  - `markdown-header` — splits at ATX headings (`# … ######`)
  - `token-window` — Phase 1 alias for fixed-window; real BPE counts arrive in v0.2.0

**Controls**

- Registry-driven strategy selector (Radix UI Select)
- Chunk size: number input + range slider, synchronized, min 1 / max 2000
- Chunk overlap: works on **all 8 strategies** (ChunkViz disables it on recursive splitters); capped at `chunkSize − 1`; warning shown when overlap exceeds 50% of chunk size
- Strategy change resets size and overlap to per-strategy defaults and never replaces the user's text
- All params persisted to `localStorage` (`cl-params` key)

**Chunk canvas**

- Source rendered once as a continuous block; chunk boundaries show as color runs
- 8-hue CVD-safe palette (`--chunk-0` through `--chunk-7`) cycling by chunk index
- Overlap regions: hatch pattern (45-degree repeating gradient) over the base color
- Gap regions (untouched source text): rendered in `--gap-text` color — not silently hidden
- Roving tabindex across interactive runs; `ArrowLeft` / `ArrowRight` / `Home` / `End`
- Screen-reader-accessible `<table>` fallback (`ChunkTable`) with Index / Start / End / Length / Preview columns
- `RenderBudgetNotice` when chunk count exceeds the 2,000-run render cap

**Statistics**

- Four labeled figures replacing ChunkViz's single misleading "Total Characters" stat:
  - **Input** — source character count (what ChunkViz incorrectly labelled "Total Characters")
  - **Emitted** — total characters across all chunks, including overlap duplicates (what ChunkViz showed)
  - **Unique** — character positions covered by at least one chunk (union of chunk ranges)
  - **Duplicated** — `emitted − unique`; characters written more than once (from overlapping chunks)
- Warning chips for: no chunks produced, high duplication ratio (> 50%)

**Infrastructure**

- Design tokens: dark-first, light override via `@media (prefers-color-scheme: light)` and `[data-theme]`
- IBM Plex Sans (UI) + IBM Plex Mono (canvas/code) typefaces
- Vitest 2.x + Testing Library with full jsdom polyfills for Radix UI
- 154 tests across 16 test files; 90% branch + statement coverage gate on `src/lib/`
- ESLint 9 flat config (strictTypeChecked) + Prettier + husky + lint-staged
- GitHub Actions CI: typecheck → lint → format → test → build

### Parity matrix

23 items verified against ChunkViz behavior. Ticked = implemented; note = intentional difference.

| #   | Item                                       | Status                                                                    |
| --- | ------------------------------------------ | ------------------------------------------------------------------------- |
| 1   | Default sample text (2,658-char prose)     | ✓                                                                         |
| 2   | Editable textarea                          | ✓                                                                         |
| 3   | `.txt` upload button                       | ✓                                                                         |
| 4   | `.txt` drag-and-drop                       | ✓                                                                         |
| 5   | Strategy dropdown                          | ✓ — 8 strategies (ChunkViz has 5)                                         |
| 6   | Chunk size: number input + range slider    | ✓                                                                         |
| 7   | Chunk overlap: number input + range slider | ✓ — enabled on all 8 strategies (ChunkViz: only 1)                        |
| 8   | Stats: input char count                    | ✓ — labeled "Input" to distinguish from emitted                           |
| 9   | Stats: emitted char count                  | ✓ — labeled "Emitted"; this is what ChunkViz showed as "Total Characters" |
| 10  | Stats: unique covered chars                | ✓ — new figure not in ChunkViz                                            |
| 11  | Stats: duplicated chars                    | ✓ — new figure not in ChunkViz                                            |
| 12  | Real-time update on parameter change       | ✓                                                                         |
| 13  | Color-coded chunk visualization            | ✓ — 8-hue palette                                                         |
| 14  | Overlap highlight                          | ✓ — hatch pattern (CVD-safe); ChunkViz uses color only                    |
| 15  | Gap rendering                              | ✓ — untouched source shown as dim region; ChunkViz hides gaps             |
| 16  | Keyboard navigation (arrow keys)           | ✓ — not in ChunkViz                                                       |
| 17  | Keyboard navigation (Home/End)             | ✓ — not in ChunkViz                                                       |
| 18  | Screen-reader table fallback               | ✓ — not in ChunkViz                                                       |
| 19  | Dark theme                                 | ✓ — default; follows system preference                                    |
| 20  | Light theme                                | ✓ — via system preference or manual toggle                                |
| 21  | Render budget notice                       | ✓ — shown when > 2,000 chunks                                             |
| 22  | No-chunks warning chip                     | ✓ — fired when chunk size exceeds source length                           |
| 23  | High-duplication warning chip              | ✓ — fired when > 50% of emitted chars are duplicates                      |

### Fixed

- ChunkViz reports emitted character count as "Total Characters", making it impossible to distinguish document length from output volume. Resolved by separating all four figures with distinct labels.

[0.1.0]: https://github.com/badrusiddique/chunk-lens/releases/tag/v0.1.0
