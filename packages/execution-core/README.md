# `@workspace/execution-core`

The core workflow execution engine for the `n8n-automation` platform. This package is responsible for interpreting the node-based workflows created in the UI and executing them sequentially or parallelly based on the defined edges.

## Technology Used

- **Language**: TypeScript
- **Concurrency**: `p-limit` (for managing parallel executions)
- **AI Integration**: Vercel AI SDK (`ai`)
- **Email Delivery**: `resend`

## What It Serves

When a user triggers a workflow from the UI, the `execution-core` takes over. It:
- Resolves expressions and variables from previous nodes.
- Manages the execution state and passes data along the edges.
- Handles retries, errors, and conditional logic.
- Integrates with actual services (e.g., sending an email, calling an AI model, executing custom HTTP requests).

## Folder Structure

- `src/`:
  - `workflow-runner.ts`: The main runner class that orchestrates the execution of the entire workflow.
  - `expression-resolver.ts`: Parses and resolves dynamic expressions (like referencing data from a previous step).
  - `execute-provider.ts`: Manages the specific execution logic of different node types.
  - `execution-functions.ts`: Helper functions and logic specific to execution tasks.
  - `node-output.ts`: Standardizes the output structure from nodes.

## How to Use

This package is designed to be imported by the API routes or background workers in `apps/web`.

```typescript
import { WorkflowRunner } from '@workspace/execution-core';

// Initialize the runner with workflow data
const runner = new WorkflowRunner(workflowData);

// Execute the workflow
const result = await runner.run();
```
