# `web` (Next.js Application)

The main web application for the `n8n-automation` platform. It provides the visual drag-and-drop interface for users to build, manage, and execute automated workflows.

## Technology Used

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: `@workspace/ui` (shadcn/ui, Radix UI)
- **Visual Workflow Builder**: React Flow (`@xyflow/react`)
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Form Handling & Validation**: React Hook Form, Zod
- **Authentication**: NextAuth.js (via `next-auth`)
- **Mailing**: Nodemailer

## What It Serves

This application acts as the front-end interface and the primary API route handler for the workflow builder. Users interact with this app to:
- Visually drag and connect nodes (e.g., triggers, actions) onto a canvas.
- Configure node properties and credentials.
- View workflow execution logs.
- Manage authentication.

## Folder Structure

The structure follows standard Next.js App Router conventions:
- `src/app`: Application routes, pages, and API endpoints.
- `src/components`: React components specific to the web app (generic UI components are imported from `@workspace/ui`).
- `src/lib`: Utility functions and clients (e.g., database clients, redis).
- `src/store`: Zustand state management stores.
- `src/styles`: Global CSS (like `globals.css`).

## How to Run Locally

This app is designed to be run via the Turborepo root command, but can also be run individually from this directory.

1. Ensure the database is running (via Docker from the root directory).
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run the Turbopack development server:
   ```bash
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
