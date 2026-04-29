# `@workspace/database`

This package handles all database interactions for the `n8n-automation` monorepo. It centralizes the schema, migrations, and the Prisma Client used by other packages and apps.

## Technology Used

- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Language**: TypeScript
- **Environment Management**: `dotenv`

## What It Serves

- **Centralized Schema**: Acts as the single source of truth for the database structure (`prisma/schema.prisma`).
- **Prisma Client**: Exports the generated Prisma Client instance so that `apps/web` or `packages/execution-core` can query the database without managing their own connection pools.
- **Migrations**: Holds the migration history ensuring schema changes are tracked properly.

## Folder Structure

- `prisma/`:
  - `schema.prisma`: The primary Prisma schema definition.
  - `migrations/`: Auto-generated SQL migration files.
  - `seed.ts`: Script for seeding the database with initial/dummy data.
- `index.ts`: The entry point exporting the instantiated Prisma Client.

## How to Run Locally

You generally don't "run" this package directly as a server, but you will use it to apply schema changes to your local database.

1. Ensure the PostgreSQL docker container is running.
2. Inside this directory (`packages/database`), run:

```bash
# Push schema changes directly without generating a migration (useful for fast local dev)
bun run db:push

# Or, generate and apply migrations
bun run db:migrate:dev

# Generate the Prisma client
bun run generate

# Open the Prisma Studio GUI to view the local data
bun run studio
```
