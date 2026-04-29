# `@workspace/ui`

The shared component library for the `n8n-automation` platform, providing a cohesive and accessible design system.

## Technology Used

- **Base Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Primitives**: Radix UI
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Interactivity**: React, `lucide-react` (icons), `react-resizable-panels`
- **Workflow UI Utilities**: `@xyflow/react` (for specific workflow canvas UI parts)

## What It Serves

This package abstracts away complex UI components, ensuring that the visual identity of the platform is consistent, accessible, and easily maintainable. 

- **Reusability**: `apps/web` simply imports pre-built, styled components (like Buttons, Dialogs, Inputs) without worrying about the underlying HTML/CSS.
- **Theming**: Centralizes Tailwind configurations and theme variables (colors, spacing, dark mode via `next-themes`).
- **Standardization**: Enforces UX consistency across the application.

## Folder Structure

- `src/components/`: Individual component folders (usually grouped by primitive, e.g., `button.tsx`, `dialog.tsx`).
- `src/hooks/`: Shared UI-related React hooks.
- `src/lib/`: Utilities like `utils.ts` (for `clsx` and `tailwind-merge`).
- `src/styles/`: Global styles and Tailwind base layers (`globals.css`).

## Adding Components

We use the `shadcn/ui` CLI to scaffold components directly into this package.

From the root of the monorepo, run:

```bash
pnpm dlx shadcn@latest add [component-name] -c apps/web
# Note: The command specifies apps/web as the config context, but the files will be placed in packages/ui/src/components based on the components.json setup.
```

## How to Use

Components are exported via the package's `exports` map in `package.json`.

```tsx
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';

export default function MyForm() {
  return (
    <form>
      <Input placeholder="Enter value" />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```
