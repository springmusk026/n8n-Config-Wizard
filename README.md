# n8n Configuration Wizard

A configuration generator for self-hosted [n8n](https://n8n.io) deployments. Generate Docker Compose files, environment variables, and Kubernetes manifests through an interactive web interface.

## Demo

Visit the live application or run locally to configure your n8n instance.

## Why This Tool

Configuring n8n for production requires setting dozens of environment variables correctly. This tool:

- Eliminates manual documentation lookup for 80+ configuration options
- Validates dependencies (e.g., PostgreSQL fields when `DB_TYPE=postgresdb`)
- Generates deployment-ready configuration files
- Provides templates for common scenarios (minimal, production, queue-mode, enterprise)

## Quick Start

```bash
git clone https://github.com/springmusk026/n8n-config-wizard.git
cd n8n-config-wizard
pnpm install
pnpm dev
```

Open `http://localhost:3000`

## Usage

1. Select a deployment template or start with custom configuration
2. Configure variables across categories (Database, Security, Queue, etc.)
3. Review validation errors and fix any issues
4. Generate output in your preferred format
5. Download or copy the configuration

## Output Formats

| Format | File | Use Case |
|--------|------|----------|
| Docker Compose | `docker-compose.yml` | Single-host deployments |
| Environment | `.env` | Any container runtime |
| Docker Run | `run-n8n.sh` | Quick testing |
| Kubernetes | `n8n-deployment.yaml` | Cloud-native deployments |

## Templates

| Template | Description | Key Features |
|----------|-------------|--------------|
| Minimal | Development/testing | SQLite, basic auth |
| Production | Single-instance production | PostgreSQL, encryption |
| Queue Mode | Distributed execution | Redis, worker scaling |
| Enterprise | Full-featured | All integrations enabled |
| AI-Enabled | LangChain workflows | AI assistant, vector stores |

## Validation

The wizard validates:

- **Type checking**: Numeric fields accept only numbers
- **Dependencies**: PostgreSQL fields required when `DB_TYPE=postgresdb`
- **Dependencies**: Redis fields required when `EXECUTIONS_MODE=queue`
- **Required fields**: Core configuration must be set before generation

## Development

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Run tests
pnpm test

# Production build
pnpm build
```

## Project Structure

```
app/                      # Next.js pages
components/
  ui/                     # Base UI components (shadcn/ui)
  wizard/                 # Wizard-specific components
    config-form.tsx       # Variable configuration form
    category-sidebar.tsx  # Category navigation
    output-panel.tsx      # Generated output display
    template-selector.tsx # Template selection grid
lib/
  parser/                 # .env, YAML, JSON parsers
  validation/             # Validation rules engine
  n8n-config.ts          # Variable definitions
  diff.ts                # Configuration comparison
  template-manager.ts    # Custom template storage
__tests__/
  unit/                  # Unit tests
  properties/            # Property-based tests (fast-check)
```

## Tech Stack

- Next.js 16 / React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Vitest + fast-check

## Configuration Categories

- **Deployment**: Host, port, protocol, webhook URL
- **Database**: SQLite or PostgreSQL settings
- **Executions**: Timeouts, data retention, pruning
- **Queue Mode**: Redis connection, worker settings
- **Security**: Encryption key, authentication, cookies
- **Logging**: Log level, output format, file rotation
- **SMTP**: Email server configuration
- **Storage**: S3 external storage
- **AI**: LangChain, AI assistant settings
- **Source Control**: Git integration

## Author

**Basanta Sapkota**
- GitHub: [@springmusk026](https://github.com/springmusk026)

## License

MIT with Attribution Requirement - You are free to use, modify, and distribute this software provided you:

- Credit the original author (Basanta Sapkota)
- Link to the original repository
- Keep the attribution in derivative works

See [LICENSE](LICENSE) for full terms.
