# CLAUDE.md

## Project Overview

**My Fat Senator** is a full-stack TypeScript monorepo tracking U.S. congressional votes. It imports data from two sources and presents it in a Remix web app:

- **Congress.gov API** — queried via `lib/services/congress-api.ts`
- **XML/JSON vote summaries** — fetched from the Congress.gov website and processed by tools in the adjacent `../congress/` directory

## Monorepo Structure

```
lib/                        # Shared library (workspace: @my-fat-senator/lib)
  models/                   # Prisma-backed CRUD operations per entity
  services/                 # Business logic (congress-api, http, file, logger, cli)
  interfaces/               # TypeScript shapes for Congress API responses
  prisma/                   # Schema, migrations, seed — SQLite at lib/prisma/data.db
packages/
  my-fat-senator/           # Remix web app (workspace: @my-fat-senator/my-fat-senator)
    app/routes/             # Remix routes (_index, votes._index, votes.$id, healthcheck)
    app/shared/             # Reusable React components (layout, renderers)
  importer/                 # CLI for importing votes and legislators
scripts/                    # Utility scripts
```

## Common Commands

```bash
# Development
npm run dev                   # Remix dev server (http://localhost:3000)

# Build
npm run build                 # tsc --build (all workspaces)

# Database
npm run migrate               # Prisma migrations (run from packages/my-fat-senator)
npm run setup                 # prisma generate + migrate + seed

# Data import
npm run import-votes          # Import congressional vote records
npm run import-legislators    # Import legislator data

# Testing
npm test                      # Vitest unit tests
npm run test:e2e:dev          # Cypress interactive
npm run test:e2e:run          # Cypress headless
npm run validate              # Tests + lint + typecheck

# Code quality
npm run lint
npm run format
npm run typecheck
```

## Tech Stack

- **Framework**: Remix 2 (React 18)
- **Language**: TypeScript 5 (strict mode)
- **ORM**: Prisma 5 with SQLite
- **Styling**: Tailwind CSS + DaisyUI (theme: `corporate`)
- **Data grid**: ag-grid-react
- **Unit tests**: Vitest
- **E2E tests**: Cypress
- **Node**: 20.5.1 (see `.nvmrc`)

## Key Conventions

- **Prisma lives in `lib/`** — all workspaces import `@my-fat-senator/lib` to access it. Never add Prisma to individual package dependencies.
- **Models** (`lib/models/`) are thin wrappers around Prisma queries — no business logic.
- **Services** (`lib/services/`) contain business logic and call models directly (no DI layer).
- **Date serialization**: Remix serializes dates as strings over the wire. Deserialize manually on the client when needed.
- **Senate vs. House IDs**: Senate votes map legislators via `bioguideid`; House votes use a different mapping. See importer services for details.
- **TypeScript project references**: `tsconfig.json` at root references `lib`, `importer`, and `my-fat-senator`. Run `tsc --build` from root to compile everything.
- **Remix bundling**: `remix.config.js` marks `@my-fat-senator/*` as server dependencies (not bundled for client).
- **Dynamic Tailwind classes**: Must be added to `safelist` in `tailwind.config.ts` or they will be purged.

## Database Schema (key models)

- `Vote` — a congressional vote (chamber, session, category, result)
- `Ballot` — a legislator's individual vote on a `Vote`
- `Legislator` — congressional member with `bioguideId`
- `LegislatorDepiction` — portrait image URLs
- Supporting enums/lookup tables: `Party`, `State`, `Chamber`, `BallotChoiceType`, `CategoryType`, `VoteType`, `ResultType`
