# `@workspace/types`

A centralized package for defining and exporting TypeScript interfaces, types, and enums used across the entire `n8n-automation` monorepo.

## Technology Used

- **Language**: TypeScript
- **Validation/Typing**: `zod`
- **UI Types**: `@xyflow/react` (React Flow), `lucide-react`

## What It Serves

By keeping types in a standalone package, we ensure that both the frontend (`apps/web`) and backend services (like `packages/execution-core` and `packages/database`) speak the exact same language. 

It serves:
- **Shared Contracts**: Defines the exact shape of a Workflow, Node, Edge, or Execution Result.
- **Zod Schemas**: Re-exports types inferred from Zod validators to guarantee compile-time and run-time safety.
- **UI Integration**: Types for React Flow graph state, ensuring the UI builder seamlessly translates to backend execution models.

## Folder Structure

Types are generally categorized by domain:
- `src/index.ts`: The main barrel file exporting all types.
- *(Other `.ts` files inside `src` depending on domain, e.g., `workflow.ts`, `nodes.ts`, `auth.ts`)*

## How to Use

Simply import the types into any app or package within the workspace:

```typescript
import type { Workflow, NodeData } from '@workspace/types';

function processWorkflow(workflow: Workflow) {
  // TypeScript will enforce the workflow structure
}
```
