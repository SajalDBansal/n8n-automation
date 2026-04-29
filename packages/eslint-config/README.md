# `@workspace/eslint-config`

Shared ESLint configuration for the `n8n-automation` monorepo.

## What It Serves

In a large monorepo, keeping code style and linting rules consistent across multiple packages and apps is critical. This package exports base ESLint configurations that can be extended by any other package.

- **Consistency**: Enforces a unified code style and catches common JavaScript/TypeScript errors.
- **Next.js & React support**: Includes specific rules for React hooks and Next.js best practices.
- **Maintainability**: Centralizes rule management. Changing a rule here propagates to the entire workspace.

## How to Use

In any package's `.eslintrc.js` or `eslint.config.js`, you can extend from this package:

```javascript
module.exports = {
  extends: ["@workspace/eslint-config"],
  // ... any package-specific overrides
};
```
