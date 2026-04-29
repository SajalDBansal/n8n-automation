# `@workspace/validators`

This package houses the centralized validation logic and schemas for the `n8n-automation` platform.

## Technology Used

- **Validation**: [Zod](https://zod.dev/)
- **Tokens**: `jsonwebtoken` (for auth and secure payload validation)
- **Language**: TypeScript

## What It Serves

Data enters the platform from multiple vectors (API requests, UI forms, incoming webhooks, database reads). This package serves as the gatekeeper, ensuring all data is structurally and logically sound.

- **API Validation**: Validates the request bodies in Next.js API routes before processing.
- **Form Validation**: Provides schemas directly to the frontend (`react-hook-form` via `@hookform/resolvers/zod`).
- **Configuration Validation**: Ensures user-provided settings or node credentials match required formats.
- **Security**: Handles the generation and validation of JSON Web Tokens (JWT) for user sessions and secure external triggers.

## Folder Structure

- `src/`:
  - `auth/`: Schemas related to login, registration, and session management.
  - `workflows/`: Schemas defining valid workflow payloads and updates.
  - `nodes/`: Validation logic for specific node configurations and credentials.
  - `index.ts`: The main entry point.

## How to Use

Schemas define the structure, and they can also be used to infer the static TypeScript types (which are then typically exported from `@workspace/types`).

```typescript
import { workflowSchema } from '@workspace/validators';

// In an API route
const result = workflowSchema.safeParse(requestBody);

if (!result.success) {
  return new Response("Invalid data", { status: 400 });
}
```
