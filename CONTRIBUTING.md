# Contributing to chunk-lens

## Getting started

```bash
git clone https://github.com/badrusiddique/chunk-lens.git
cd chunk-lens
pnpm install
pnpm dev
```

Node 22+ and pnpm 9+ are required. The `.nvmrc` pins the Node version.

## Development workflow

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Write tests first for anything in `src/lib/` (pure TypeScript)
3. Implement the feature
4. Run `pnpm verify` — this must pass before opening a PR
5. Open a pull request against `main`

## Quality gates

`pnpm verify` runs:

```
typecheck → lint → format:check → test → build
```

CI enforces this on every push and PR. The `main` branch requires CI to be green.

## Code conventions

- TypeScript strict mode, no `any`, no `@ts-ignore`
- `src/lib/` must have zero React imports — it is framework-agnostic pure TypeScript
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`
- No TODO comments in merged code — every PR is a complete unit of work
- Comments only for non-obvious _why_, not _what_

## Test requirements

- `src/lib/` must maintain 90% statement and branch coverage
- Every acceptance criterion in `docs/decisions/` must have a named test
- New UI components need an axe accessibility assertion

## Reporting issues

Open an issue on GitHub with a minimal reproduction case.
