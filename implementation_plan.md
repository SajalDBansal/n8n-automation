# Port Fuzzie Editor UI into n8nIkram

## Goal
Replace n8nIkram's plain white editor with fuzzie-production's dark, glassmorphism-themed editor UI — including the resizable panel layout, Card-based node cards, dark dot-grid background, and Tabs-based sidebar — while keeping 100% of n8nIkram's execution engine, node system, and WebSocket real-time feedback.

## What Fuzzie's Editor Has (We Want)

| Feature | Details |
|---|---|
| **Dark theme** | Near-black background (`#171717` / dark neutral), dark Cards |
| **Resizable panels** | Left 70% = canvas, Right 40% = sidebar (shadcn `resizable`) |
| **Card-based node cards** | `Card` + `CardHeader` + icon + title + description + badge |
| **Execution status dot** | Small colored circle (green/orange/red) in top-left of card |
| **Dot-grid background** | `Background variant="dots"` with dark tint |
| **Sidebar with Tabs** | "Actions" tab = draggable node list, "Settings" tab = selected node config |
| **Top navbar** | Workflow name + Save + Publish buttons |
| **Draggable node palette** | Cards with service icons, draggable onto canvas |

## What n8nIkram Has (We Keep)

| Feature | Details |
|---|---|
| **Execution engine** | Redis queue + WorkflowRunner — unchanged |
| **Node types** | `nodes-base` package — unchanged |
| **Real-time updates** | SSE/EventSource → node status — unchanged |
| **WorkflowSidebar** | API-driven list of nodes — keep it, restyle it |
| **NodeConfigModal** | Double-click config — keep it, restyle backdrop |
| **ExecutionOutputPanel** | Output panel — keep unchanged |
| **Custom node shapes** | TriggerNode (pill left), ActionNode, AgentNode, ModelNode — upgrade styling |
| **useWorkflowEditor hook** | Save, load, snapshot logic — unchanged |
| **isValidConnection** | Graph-edge validation logic — unchanged |

---

## Proposed Changes

### 1. Global Styles & Dark Theme

#### [MODIFY] [globals.css](file:///d:/YOUTUBE/n8nIkram/apps/web/app/globals.css)
- Toggle the `:root` to a **dark-by-default** theme (matching fuzzie's dark canvas background)
- Add CSS vars for the editor canvas dark background (`--editor-bg: oklch(0.12 0 0)`)
- Add font import for **Inter** (fuzzie uses this via Tailwind `font-sans`)

---

### 2. Node Card Redesign

#### [MODIFY] [ActionNode.tsx](file:///d:/YOUTUBE/n8nIkram/apps/web/components/custom-nodes/ActionNode.tsx)
Port fuzzie's `EditorCanvasCardSingle` Card design:
- Wrap in shadcn `<Card>` with dark background (`dark:bg-neutral-900 dark:border-neutral-700`)
- Add `<CardHeader>` with icon + title + description layout  
- Add type `<Badge>` in top-right corner
- Add execution status colored dot in top-left (green/orange/red based on `executionStatus`)
- Keep existing `Handle` source/target positions (Left/Right)
- Keep `NodeDeleteButton` and `NodeExecutionIndicator`
- Add label below card

#### [MODIFY] [TriggerNode.tsx](file:///d:/YOUTUBE/n8nIkram/apps/web/components/custom-nodes/TriggerNode.tsx)
Same fuzzie Card design but:
- Use a `Trigger` badge variant
- Keep the left-rounded pill shape characteristic of trigger nodes
- Only `source` handle (right side)

#### [MODIFY] [AgentNode.tsx](file:///d:/YOUTUBE/n8nIkram/apps/web/components/custom-nodes/AgentNode.tsx)
- Apply same Card design with purple/AI accent color
- Keep the sub-handles (chat-model, memory, tool) at the bottom

#### [MODIFY] [ModelNode.tsx](file:///d:/YOUTUBE/n8nIkram/apps/web/components/custom-nodes/ModelNode.tsx)
- Apply same Card design with teal/model accent
- Keep existing handle structure

---

### 3. Main Editor Canvas Redesign

#### [MODIFY] [workflow-editor.tsx](file:///d:/YOUTUBE/n8nIkram/apps/web/components/workflow-editor.tsx)

Key layout changes:
```
BEFORE: flex horizontal div (canvas | floating sidebar)
AFTER:  ResizablePanelGroup (70% canvas | ResizableHandle | 40% sidebar)
```

Specific changes:
- Import and use shadcn `<ResizablePanelGroup>`, `<ResizablePanel>`, `<ResizableHandle>`
- Split the current single-div layout into a proper resizable panel group
- Left panel (70%): Contains ReactFlow canvas with dark background
- Right panel (40%): Contains the **new Tabs sidebar** (see §4)
- Move the execute button from floating-bottom to the top navbar area
- Style the top navbar bar with dark theme: `bg-neutral-950 border-neutral-800`
- Style the tab bar (Editor / Executions) with dark underline style
- Change `<Background />` to `variant="dots"` with dark grid color
- Change `<MiniMap />` to add `className="!bg-neutral-900"`
- Add loading spinner overlay matching fuzzie's SVG spinner

---

### 4. New Tabs Sidebar (Replacing WorkflowSidebar Floating Panel)

Currently n8nIkram has a **floating overlay** sidebar that hides the canvas. We replace it with a **persistent right panel** matching fuzzie's design.

#### [NEW] [editor-right-panel.tsx](file:///d:/YOUTUBE/n8nIkram/apps/web/components/editor-right-panel.tsx)
This replaces the in-editor sidebar panel. Features:
- **"Actions" tab**: Shows draggable/clickable list of trigger + action nodes (same data from API as WorkflowSidebar, but rendered as small Cards with icons)
- **"Settings" tab**: Shows selected node details (feeds into existing `NodeConfigModal` trigger, or shows inline config)
- Dark-themed `<Tabs>` matching fuzzie's pattern
- Keep existing axios calls to `/api/rest/available-triggers` and `/api/rest/available-actions`

---

### 5. CSS Additions (Dark Editor Theme)

Add dedicated editor canvas styles to the global CSS:
```css
/* Dark editor canvas */
.react-flow__background { background-color: var(--editor-bg); }
.react-flow__minimap { background: oklch(0.12 0 0) !important; }
.react-flow__controls button { 
  background: oklch(0.18 0 0); 
  border-color: oklch(0.25 0 0);
  color: oklch(0.9 0 0);
}
```

---

## Files Modified Summary

| File | Change |
|---|---|
| `apps/web/app/globals.css` | Add editor dark theme vars + Inter font |
| `apps/web/components/workflow-editor.tsx` | ResizablePanelGroup layout + dark navbar + dark canvas |
| `apps/web/components/custom-nodes/ActionNode.tsx` | Card-based design, status dot, Badge |
| `apps/web/components/custom-nodes/TriggerNode.tsx` | Card-based design, Trigger badge |
| `apps/web/components/custom-nodes/AgentNode.tsx` | Card-based design, AI badge |
| `apps/web/components/custom-nodes/ModelNode.tsx` | Card-based design, Model badge |
| `apps/web/components/editor-right-panel.tsx` | **NEW**: Tabs sidebar (Actions + Settings) |

## Files NOT Modified (Execution/Logic Preserved)

- `packages/execution-core/**` — completely untouched
- `apps/execution-engine/**` — completely untouched
- `packages/nodes-base/**` — completely untouched
- `apps/web/hooks/useWorkflowEditor.ts` — untouched
- `apps/web/components/node-config-modal.tsx` — untouched
- `apps/web/components/execution-output-panel.tsx` — untouched
- `apps/web/store/**` — untouched
- All API routes — untouched

## Dependencies to Add

`shadcn/ui resizable` component (if not already present):
```bash
npx shadcn@latest add resizable
```

## Verification Plan

1. Run `npm run dev` in `apps/web`
2. Navigate to a workflow editor page
3. Verify: Dark canvas with dot grid background
4. Verify: Cards render with icon + title + description + Badge
5. Verify: Status dot updates (green/orange/red) during execution
6. Verify: Resizable panel handle works (drag to resize)
7. Verify: Actions tab shows nodes, clicking adds them to canvas
8. Verify: Settings tab updates when a node is clicked
9. Verify: Execution still works (SSE updates node status colors)
10. Verify: Save, Execute buttons work as before
