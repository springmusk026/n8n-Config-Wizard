# Contributing

## Setup

```bash
git clone https://github.com/springmusk026/n8n-config-wizard.git
cd n8n-config-wizard
pnpm install
pnpm dev
```

## Development Workflow

1. Create a branch: `git checkout -b feature/your-feature`
2. Make changes
3. Run tests: `pnpm test`
4. Commit with descriptive message
5. Push and open PR

## Code Style

- TypeScript for all code
- Follow existing patterns
- Run `pnpm lint` before committing

## Commit Format

```
type: description

feat: add new feature
fix: resolve bug
docs: update documentation
test: add tests
refactor: code improvement
```

## Testing

```bash
pnpm test          # Run once
pnpm test:watch    # Watch mode
pnpm test:coverage # With coverage
```

## Adding Configuration Variables

1. Add variable definition in `lib/n8n-config.ts`
2. Add validation rules in `lib/validation/rules.ts` if needed
3. Add to appropriate category
4. Write tests

## Questions

Open an issue for discussion.
