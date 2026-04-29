# n8n-automation

`n8n-automation` is a full-stack, highly scalable visual workflow automation tool designed to rival platforms like n8n, Zapier, and Make. It empowers users to seamlessly integrate different services, trigger events, and automate complex, multi-step tasks without writing code. 

By providing an intuitive drag-and-drop canvas, users can string together customized sequences of actions, logic, and conditional paths. Under the hood, a robust execution engine processes these workflows in real-time or asynchronously, handling variable resolution, branching logic, and third-party API communication.

## How it Works (The Flow)

The platform is designed around a seamless user journey from visual creation to backend execution:

1. **Authentication & Dashboard**: A user signs into the platform and lands on their personal dashboard.
2. **Project & Workflow Creation**: The user creates a new project and within it, a new workflow.
3. **Visual Building**: Using the drag-and-drop canvas (powered by React Flow), the user adds nodes (Triggers, Actions, Logic) and connects them via edges to define the execution path. They configure node-specific credentials and parameters.
4. **Execution Trigger**: When the user clicks "Execute", an API call is made to the Next.js backend.
5. **Event Streaming**: The backend establishes an event stream (Server-Sent Events) back to the client.
6. **Core Execution**: The backend invokes the `execute` function from the `@workspace/execution-core` package.
7. **Node Resolution**: The execution core traverses the workflow graph. For each node, it resolves any dynamic expressions (e.g., fetching data from a previous node's output), executes the specific node's logic, and emits the status and output back through the event stream.
8. **Real-time Feedback**: The user sees the nodes light up and display results in real-time on the canvas as the execution progresses.

## Architecture overview

This project is structured as a monorepo using [Turborepo](https://turbo.build/repo). It is broadly divided into applications (`apps/`) and shared library packages (`packages/`).

### Tech Stack
- **Frontend & App Framework**: Next.js (App Router), React
- **UI Components**: Tailwind CSS, shadcn/ui, Framer Motion
- **Visual Node Builder**: React Flow (`@xyflow/react`)
- **Database & ORM**: PostgreSQL, Prisma
- **Core Engine**: Custom execution core using Vercel AI SDK and `p-limit` for concurrency
- **Package Manager**: Bun
- **Infrastructure**: Docker, Redis (for caching and queues)

### Folder Structure

```text
n8n-automation/
├── apps/
│   └── web/                   # Main Next.js web application (Dashboard, Canvas, API routes)
├── packages/
│   ├── database/              # Prisma schema, migrations, and database client setup
│   ├── execution-core/        # Core engine that runs workflows and resolves expressions
│   ├── node-base/             # Base classes and types defining standard workflow nodes
│   ├── types/                 # Shared TypeScript interfaces and types
│   ├── validators/            # Zod validation schemas for API inputs and JWT configurations
│   ├── ui/                    # Shared UI component library (shadcn/ui, Radix UI)
│   ├── eslint-config/         # Shared ESLint configurations
│   └── typescript-config/     # Shared tsconfig bases
├── docker/                    # Docker compose files for local infrastructure (Postgres, Redis)
├── package.json               # Monorepo dependencies and turbo scripts
└── turbo.json                 # Turborepo build pipeline configuration
```

## Getting Started

### Prerequisites
- Node.js >= 20
- Bun package manager (`npm install -g bun`)
- Docker (for running PostgreSQL and Redis locally)

### Installation
1. Clone the repository.
2. Install dependencies using Bun:
   ```bash
   bun install
   ```

### Running Locally
To quickly set up the environment and run the Next.js development server:

1. **Start infrastructure (Database)**:
   ```bash
   bun run docker:start
   ```
2. **Push the database schema**:
   Navigate to `packages/database` and push the schema or just run from root if defined:
   ```bash
   turbo db:push
   # OR
   cd packages/database && bun run db:push
   ```
3. **Start the development server**:
   ```bash
   bun dev
   # OR for the full local experience
   bun run local
   ```
The web app should now be running at `http://localhost:3000`.

### Other useful commands
- `bun run build` - Build the entire workspace with Turborepo.
- `bun run lint` - Lint all packages and apps.
- `bun run typecheck` - Typecheck all packages and apps.

## Roadmap & TODOs

### ⏳ Standalone Execution Engine (Worker)
**Goal:** Create a decoupled execution engine to handle workflows triggered without active client connections (e.g., scheduled cron jobs, external webhooks).
- Implement a Redis-backed job queue.
- When a workflow is triggered externally (without the client UI), push the job to the Redis queue.
- A standalone Node.js worker service will extract the next workflow ID from the queue.
- The worker will fetch the workflow structure and required credentials from the database.
- The worker will run the workflow using the existing `@workspace/execution-core` package natively, independent of the Next.js API.
