# chunk-lens

A developer tool for visualising text chunking strategies used in retrieval-augmented generation (RAG) pipelines. Paste or upload text, pick a splitting strategy and tune the parameters, and see exactly where chunk boundaries fall — including overlaps and gaps.

> **Live demo:** https://chunk-lens.vercel.app _(available after v0.1.0)_

---

## What it does

Language models perform better when given focused, relevant context rather than an entire document. Chunking is how you get there: a large piece of text is divided into smaller pieces, each piece is embedded independently, and at query time only the most relevant pieces are retrieved and sent to the model.

The quality of that retrieval depends heavily on where you draw the chunk boundaries. chunk-lens makes those boundaries visible so you can tune your strategy before you build the pipeline.

## Features

| Feature                       | Details                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| **8 chunking strategies**     | Fixed window, Recursive (plain / JS / Python / Markdown), Sentence, Markdown header, Token window  |
| **Overlap on all strategies** | Recursive strategies support overlap — not disabled as an implementation shortcut                  |
| **Accurate statistics**       | Input length, emitted characters, duplicated characters, and coverage reported as separate figures |
| **Gap rendering**             | Whitespace trimmed by recursive strategies is rendered as a visible gap, not silently dropped      |
| **CVD-safe palette**          | 8-hue categorical palette with hatch pattern for overlap — readable without colour vision          |
| **Dark and light themes**     | Follows system preference, with a manual toggle                                                    |
| **Keyboard accessible**       | Full keyboard navigation of chunk runs; ChunkTable as a non-visual equivalent                      |
| **No server, no tracking**    | Entirely client-side; text never leaves your browser                                               |

## Strategies

| Strategy               | Description                                                           | Equivalent                                                 |
| ---------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| `fixed-window`         | Slice at a fixed stride, boundaries snapped to grapheme clusters      | `CharacterTextSplitter`                                    |
| `recursive-text`       | Hierarchical separators: `\n\n` → `\n` → ` ` → `''`                   | `RecursiveCharacterTextSplitter`                           |
| `recursive-javascript` | Recursive with JS-aware separator ladder                              | `RecursiveCharacterTextSplitter.from_language('js')`       |
| `recursive-python`     | Recursive with Python-aware separator ladder                          | `RecursiveCharacterTextSplitter.from_language('python')`   |
| `recursive-markdown`   | Recursive with Markdown-aware separator ladder                        | `RecursiveCharacterTextSplitter.from_language('markdown')` |
| `sentence`             | Pack sentences greedily using `Intl.Segmenter`                        | `SentenceTransformersTokenTextSplitter`                    |
| `markdown-header`      | Split at ATX headings; each chunk carries its heading breadcrumb      | `MarkdownHeaderTextSplitter`                               |
| `token-window`         | Fixed window in token space (Phase 2: real BPE ranks via js-tiktoken) | `TokenTextSplitter`                                        |

## Getting started

```bash
git clone https://github.com/badrusiddique/chunk-lens.git
cd chunk-lens
pnpm install
pnpm dev
```

Open http://localhost:5173.

**Requirements:** Node 22+, pnpm 9+.

## Development

```bash
pnpm dev          # start dev server
pnpm verify       # typecheck + lint + tests + build (must pass before any PR)
pnpm test         # unit and integration tests
pnpm test:e2e     # Playwright tests (starts dev server automatically)
pnpm test:coverage # coverage report for src/lib/
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow.

## Differences from ChunkViz

chunk-lens is an independent implementation inspired by [ChunkViz](https://chunkviz.up.railway.app) by Greg Kamradt. The following specific differences are intentional:

- **Statistics:** ChunkViz reports emitted character count as "Total Characters", which reads as document length. chunk-lens reports all four figures with distinct labels so they cannot be confused.
- **Overlap on recursive strategies:** ChunkViz disables chunk overlap for recursive splitters; this is an implementation limitation, not a property of the algorithm. chunk-lens enables it on all strategies.
- **Gap rendering:** When recursive strategies trim whitespace, ChunkViz's text jumps with only a footnote. chunk-lens renders the gap as an unhighlighted region and counts the trimmed characters.
- **Grapheme safety:** Fixed-window boundaries snap inward to grapheme cluster edges, preventing split surrogate pairs and broken emoji sequences.
- **Accessibility:** Full keyboard navigation, roving tabindex, and a table equivalent for users who cannot rely on colour.

See [NOTICE](./NOTICE) for full prior-art attribution.

## Roadmap

| Version            | Focus                                                     | Status      |
| ------------------ | --------------------------------------------------------- | ----------- |
| v0.1.0 Parity      | All ChunkViz features, correctly                          | In progress |
| v0.2.0 Insight     | Token counts, distribution histogram, per-chunk inspector | Planned     |
| v0.3.0 Portability | URL-shareable state, JSON/CSV/Markdown export             | Planned     |
| v1.0.0 Comparison  | Side-by-side strategy comparison, documentation pages     | Planned     |

## License

MIT — see [LICENSE](./LICENSE).

Prior-art attribution — see [NOTICE](./NOTICE).
