# `@workspace/typescript-config`

Shared TypeScript configurations (`tsconfig.json`) for the `n8n-automation` monorepo.

## What It Serves

Similar to the ESLint config, this package provides centralized, pre-configured base configurations for the TypeScript compiler. This ensures that compiler options, strictness levels, and module resolutions are identical across the project.

It provides multiple bases tailored to the specific environment:
- `base.json`: The strict, foundational rules for standard Node/TypeScript packages.
- `nextjs.json`: Configuration specifically optimized for Next.js applications (handling JSX, module resolution, and specific Next.js types).
- `react-library.json`: Configuration tailored for packages exporting React components (like `@workspace/ui`).

## How to Use

In any package's `tsconfig.json`, you extend the appropriate base configuration:

```json
{
  "extends": "@workspace/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```
