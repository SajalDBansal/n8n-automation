# `@workspace/node-base`

This package defines the foundational classes, interfaces, and data structures for individual workflow nodes in the `n8n-automation` platform.

## Technology Used

- **Language**: TypeScript

## What It Serves

In a node-based workflow system, every action, trigger, or logic step is represented as a "Node". This package provides the blueprint for these nodes. It serves:
- **Consistency**: Ensures every new node type added to the platform adheres to a strict contract (inputs, outputs, execution method).
- **Extensibility**: Makes it easy to add new integrations by extending base classes.
- **Shared Data**: Contains shared node-specific utilities and metadata definitions.

## Folder Structure

- `src/nodes/`: Contains the base abstract classes and interfaces for different node types (e.g., Triggers, Actions, Logic).
- `src/nodes-data/`: Contains static data, configuration definitions, and default properties for various nodes.
- `src/index.ts`: The main entry point exporting the base classes.

## How to Use

When building a new integration or workflow step, you extend from the base classes provided here:

```typescript
import { BaseNode, NodeInput, NodeOutput } from '@workspace/node-base';

export class CustomActionNode extends BaseNode {
  async execute(input: NodeInput): Promise<NodeOutput> {
    // Custom execution logic
    return { data: 'Success' };
  }
}
```
