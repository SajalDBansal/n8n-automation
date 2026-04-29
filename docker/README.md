# Docker Configurations

This directory contains the Docker configurations required to run the backing services for the `n8n-automation` local development environment.

## What It Serves

Developing a full-stack automation platform requires external dependencies like databases and message queues. Instead of installing these directly on your host machine, we containerize them.

- **Consistency**: Every developer gets the exact same versions of PostgreSQL, Redis, etc.
- **Isolation**: Keeps the host machine clean.
- **Ease of Use**: A single command spins up all necessary infrastructure.

## Folder Structure

- `docker-compose.dev.yml`: The main compose file defining the local development stack (Database, Cache, etc.).
- `docker-compose.postgres.yml`: A specific file for just the database, if you want to run it isolated.

## How to Use

From the root of the monorepo, you can start the services using the provided npm/bun scripts:

```bash
# Start all infrastructure in detached mode
bun run docker:start

# View logs from the containers
bun run docker:log

# Stop the infrastructure
bun run docker:stop
```

Alternatively, you can run docker compose directly from this directory:

```bash
cd docker
docker compose -f docker-compose.dev.yml up -d
```
