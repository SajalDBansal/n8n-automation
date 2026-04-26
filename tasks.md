---
name: Full-stack audit findings
overview: Deep audit of workflow engine, Prisma layer, API routes, and React Flow editor with concrete, file-specific bugs and exact remediations prioritized by severity.
todos:
  - id: fix-engine-traversal
    content: Add cycle detection + dedupe + branching-safe traversal in `packages/execution-core/src/workflow-runner.ts`; standardize model-node skipping semantics.
    status: pending
  - id: unify-status-enums
    content: Eliminate `FAILED` from execution status events or add it everywhere consistently; tighten `PublishPayloadDataType.status` to `ExecutionStatusType`; update SSE + frontend terminal handling.
    status: pending
  - id: fix-authz-idors
    content: Scope workflow CRUD routes by `projectId` and `session.user.id`; fix webhook route to be signed POST + scoped lookup; add authz to `apps/web/action/db/credentials.ts`.
    status: pending
  - id: fix-editor-bugs-perf
    content: Fix `removeNode` edge filter bug, stop mutating nodes on save, remove per-render `{...node}` cloning, and align handle naming/validation.
    status: pending
  - id: prisma-safety
    content: Fix invalid `findUnique` usage, handle P2025 safely via updateMany/deleteMany patterns, and review schema indexes/constraints for graph queries.
    status: pending
isProject: false
---

## CRITICAL BUGS (runtime crashes, incorrect async, broken execution)

- **Severity: Critical**
  - **File + location**: `packages/execution-core/src/workflow-runner.ts` L73-L142, especially L117-L123
  - **Problem**: Recursive execution (`executeNode` -> `executeNode(child)`) has **no cycle detection** and **no dedupe**, so cyclic graphs cause infinite recursion/stack overflow; multi-parent DAGs execute the same node multiple times.
  - **Why it is a problem**: Any workflow graph with a loop (A→B→A) will crash the worker/server; multi-parent graphs will produce duplicated side-effects (e.g. “send email twice”).
  - **Exact fix**: Introduce a traversal state keyed by `node.id`.
    - Add `visiting:Set<string>` and `done:Set<string>` to `WorkFlowRunner`.
    - In `executeNode`: if `done` has `id` return; if `visiting` has `id` throw `new Error("Cycle detected")`; add to `visiting` before executing; move to `done` after children.
    - (If you need proper fan-in semantics) replace DFS with a scheduler (Kahn/topological) that runs a node only when all upstream nodes are `done`.

- **Severity: Critical**
  - **File + location**: `packages/execution-core/src/workflow-runner.ts` L354-L361
  - **Problem**: `getConnectedNode()` uses `.find(...)` and returns only the first outbound edge, silently dropping branching.
  - **Why it is a problem**: Workflows with multiple outputs do not execute all branches; ordering becomes nondeterministic.
  - **Exact fix**: Remove use of `getConnectedNode` for main traversal; always use `getConnectedChildNodes()` and a traversal policy that supports multiple successors.

- **Severity: High**
  - **File + location**: `packages/execution-core/src/workflow-runner.ts` L93-L112
  - **Problem**: “skip model node” path sets `nodeStatus: failed` but continues execution via `getConnectedNode()`.
  - **Why it is a problem**: Produces impossible states (node failed but downstream runs) and downstream nodes may run with missing prerequisites.
  - **Exact fix**: Choose one semantic and enforce it:
    - **Stop**: publish failed, then `throw` to abort workflow.
    - **Skip**: introduce `NodeStatus.skipped` and publish skip (not failed), then continue.

- **Severity: High**
  - **File + location**: `packages/execution-core/src/workflow-runner.ts` L65-L69
  - **Problem**: Workflow-level error catch updates DB but **does not publish a terminal workflow event**; subscribers may never learn it finished.
  - **Why it is a problem**: SSE/UI can hang in “executing” state; execution logs may not show a final failure.
  - **Exact fix**: In `catch`, publish a terminal event (`status: "ERROR"` or `"CRASHED"`) including `error` and `json`.

- **Severity: High**
  - **File + location**: `packages/execution-core/src/workflow-runner.ts` L363-L385
  - **Problem**: Child routing only carries `edge.sourceHandle` (named `handleType`), and model selection checks `handleType === "chat-model"`.
  - **Why it is a problem**: In React Flow, the “semantic” handle may live on `targetHandle` (or both). Using only one side is brittle and can misroute model connections.
  - **Exact fix**: Return both `sourceHandle` and `targetHandle` from `getConnectedChildNodes`, then filter based on the editor’s canonical convention (prefer explicit `targetHandle === "chat-model"` if that’s your design).

- **Severity: Medium**
  - **File + location**: `packages/execution-core/src/workflow-runner.ts` L203-L208 and L439-L444
  - **Problem**: `modelCommonPayload.nodeData.nodeName` is set to `currentNode.name` (agent) while `nodeId` is the model node; also typo `modeNodeId`.
  - **Why it is a problem**: UI marks wrong node as executing/success; logs become misleading.
  - **Exact fix**: Use `modelNode.name` and rename `modeNodeId` -> `modelNodeId` in result type.

## DATA & DATABASE ISSUES (Prisma schema + usage)

- **Severity: Critical**
  - **File + location**: `packages/types/types/engine.ts` L5-L6 and L61-L66; `packages/execution-core/src/workflow-runner.ts` L44-L50 and L128-L137; `apps/web/app/api/projects/[projectId]/workflow/[workflowId]/execute/route.ts` L111-L115; `packages/database/prisma/schema.prisma` enum `ExecutionStatus` L138-L149
  - **Problem**: Status vocabulary mismatch: execution events use `status: "FAILED"`, SSE checks for it, but DB enum `ExecutionStatus` has no `FAILED`; `PublishPayloadDataType.status` is `string` (untyped).
  - **Why it is a problem**: If any code persists/compares against `FAILED`, it will break; UI/engine disagree on terminal states.
  - **Exact fix** (pick one and enforce everywhere):
    - **Option A**: Add `FAILED` to Prisma enum + migration (`ALTER TYPE "ExecutionStatus" ADD VALUE 'FAILED';`) and update TS unions.
    - **Option B (preferred)**: Never use `FAILED` for execution status; use `ERROR` or `CRASHED`. Update `workflow-runner.ts` publishes, SSE termination check, and frontend terminal handlers.
    - Tighten `PublishPayloadDataType.status` to `ExecutionStatusType`.

- **Severity: High**
  - **File + location**: `packages/execution-core/src/db-helper.ts` L4-L30
  - **Problem**: `updateExecutionStatusInDB` swallows Prisma errors; execution continues even if DB status did not update.
  - **Why it is a problem**: Persistent status becomes inconsistent with runtime; debugging and retries become unsafe.
  - **Exact fix**: Either rethrow (fail fast) or publish a workflow-level error event and abort; at minimum, catch `PrismaClientKnownRequestError` P2025 separately and treat as fatal.

- **Severity: Medium**
  - **File + location**: `apps/web/lib/db-calls.ts` L97-L104
  - **Problem**: `findUnique({ where: { id, projectId } })` is invalid unless you have a compound unique; schema only has `Workflow.id` unique.
  - **Why it is a problem**: This is either a type error hidden by `any`, or will fail at runtime / produce incorrect filtering.
  - **Exact fix**: Use `findFirst({ where: { id: workflowId, projectId } })` or add a compound unique (usually unnecessary since `id` is unique).

- **Severity: Medium**
  - **File + location**: `packages/database/prisma/schema.prisma` `Credential.data` L123-L136
  - **Problem**: Credentials stored as raw `Json` (likely secrets) with no app-layer encryption.
  - **Why it is a problem**: DB compromise leaks tokens/keys; also accepts arbitrary JSON shape.
  - **Exact fix**: Encrypt at rest (envelope encryption/KMS) or move secrets to a secret store; validate schema before persisting.

## WORKFLOW ENGINE VALIDATION (graph correctness, stopping conditions, ID mapping)

- **Severity: High**
  - **File + location**: `packages/execution-core/src/workflow-runner.ts` L32-L71 and L125-L141
  - **Problem**: Engine publishes node failure (`status:"FAILED"`) then rethrows; `run()` catch updates DB but does not publish terminal workflow event.
  - **Why it is a problem**: Subscribers can miss terminal state; UI can stay “running”.
  - **Exact fix**: Publish a final terminal workflow event in `run()` catch (and standardize to `ERROR/CRASHED`).

- **Severity: High**
  - **File + location**: `packages/execution-core/src/expression-resolver.ts` L44-L80
  - **Problem**: Resolver assumes `{{nodeId.path}}`; if UI expects `{{nodeName.path}}`, expressions silently resolve to `null`.
  - **Why it is a problem**: Produces incorrect parameter resolution with weak error surfacing.
  - **Exact fix**: Build a map `nodeName -> nodeId` (unique constraint in workflow) and resolve first token by id or name; return structured error rather than `null`.

## STATUS & STATE CONSISTENCY (NodeStatus/ExecutionStatus)

- **Severity: High**
  - **File + location**: `packages/types/types/engine.ts` L61-L66
  - **Problem**: `NodeStatus` values are uppercase (`"IDLE"|"EXECUTING"|...`) but engine/UI often treat status as free-form strings; `PublishPayloadDataType.status` is `string`.
  - **Why it is a problem**: Easy to introduce impossible states; UI logic misses terminal states (see below).
  - **Exact fix**: Make `PublishPayloadDataType.status: ExecutionStatusType` and enforce nodeStatus always `NodeStatus`.

- **Severity: High**
  - **File + location**: `apps/web/components/editor/workflow-editor.tsx` L479-L526
  - **Problem**: Frontend only treats `SUCCESS` and `CRASHED` as terminal; backend emits `ERROR` and sometimes `FAILED`.
  - **Why it is a problem**: Workflow execution UI can never terminate correctly on `ERROR`.
  - **Exact fix**: Treat `ERROR` (and optionally `CANCELLED`) as terminal; align backend to not emit `FAILED`.

## UI ↔ ENGINE MISMATCHES (handles, node types, routing)

- **Severity: High**
  - **File + location**: `packages/execution-core/src/workflow-runner.ts` L363-L385; `apps/web/store/editor.ts` L74-L107; `apps/web/components/editor/workflow-editor.tsx` L233-L316
  - **Problem**: Engine uses `edge.sourceHandle` to detect `"chat-model"` routing, while UI enforces rules on both `sourceHandle` and `targetHandle`. Handle conventions are not explicitly centralized.
  - **Why it is a problem**: Small UI changes can silently break engine routing.
  - **Exact fix**: Define handle IDs in a shared constant (types package) and validate during workflow save: reject edges with unknown handle IDs; engine should use a deterministic rule (e.g. targetHandle indicates the input slot).

- **Severity: Medium**
  - **File + location**: `apps/web/store/editor.ts` L83-L103
  - **Problem**: Connection restrictions mention `memory`/`tool` handles but `AgentNode` only exposes `output` and `chat-model`.
  - **Why it is a problem**: Dead/incorrect rules lead to confusing behavior when adding new handles.
  - **Exact fix**: Remove unused handle IDs or implement matching handles in the node component.

## NAMING CONSISTENCY

- **Severity: Medium**
  - **File + location**: `packages/database/prisma/schema.prisma` model `webhook` L168-L182
  - **Problem**: Prisma model is lowercase `webhook` (non-standard) and will generate surprising client API.
  - **Why it is a problem**: Naming inconsistency increases accidental misuse; makes code review harder.
  - **Exact fix**: Rename to `Webhook` (migration + code updates).

- **Severity: Medium**
  - **File + location**: `packages/execution-core/src/workflow-runner.ts` L439-L444
  - **Problem**: field named `modeNodeId` (typo) where it clearly means `modelNodeId`.
  - **Why it is a problem**: Spreads ambiguity into event payloads and future features.
  - **Exact fix**: Rename consistently across types/engine.

## TYPE SAFETY ISSUES

- **Severity: High**
  - **File + location**: `apps/web/store/editor.ts` L114-L122
  - **Problem**: `saveWorkflow` mutates live node state (`delete node.data.engine`).
  - **Why it is a problem**: Can corrupt ReactFlow/Zustand state and cause UI to lose `engine` after save.
  - **Exact fix**: Create a new `data` object excluding `engine` (no mutation).

- **Severity: High**
  - **File + location**: `apps/web/store/workflow.ts` L24-L31
  - **Problem**: `removeNode` keeps edges incorrectly: `edge.source !== nodeId || edge.target !== nodeId` should be `&&`.
  - **Why it is a problem**: Leaves dangling edges -> graph becomes invalid; engine traversal may crash or behave unexpectedly.
  - **Exact fix**: Use `edges.filter(e => e.source !== nodeId && e.target !== nodeId)`.

- **Severity: Medium**
  - **File + location**: `packages/types/types/engine.ts` L92-L107
  - **Problem**: `PublishPayloadDataType.status` is `string` and `message` is required even when some publishes omit it elsewhere.
  - **Why it is a problem**: Allows invalid status strings (`FAILED`) to leak; prevents compiler from catching mismatches.
  - **Exact fix**: Strongly type `status` and make fields optional only if truly optional.

- **Severity: Medium**
  - **File + location**: `apps/web/components/editor/workflow-editor.tsx` L98-L104, L40-L47
  - **Problem**: `normalizeLoadedEdges(edges: unknown[])` and casts `(e as any)` hide schema drift.
  - **Why it is a problem**: Handle IDs can become `null/"undefined"` and propagate into engine routing.
  - **Exact fix**: Use shared `Edge` type for DB payload and validate with zod before putting into editor state.

## SECURITY ISSUES

- **Severity: Critical**
  - **File + location**: `apps/web/app/api/projects/[projectId]/workflow/[workflowId]/route.ts` L7-L121
  - **Problem**: IDOR: GET/PATCH/DELETE operate on `workflowId` only; no check that workflow belongs to `projectId` or to `session.user.id`.
  - **Why it is a problem**: Any authenticated user can read/modify/delete other users’ workflows if they obtain an ID.
  - **Exact fix**: Scope reads/writes by ownership.
    - For reads: `findFirst({ where: { id: workflowId, projectId, project: { userId }}})`.
    - For updates/deletes: use `updateMany/deleteMany` with the same `where` and verify `count===1` to avoid P2025.

- **Severity: Critical**
  - **File + location**: `apps/web/app/api/projects/[projectId]/workflow/[workflowId]/webhook/[webhookId]/route.ts` L5-L79
  - **Problem**: Public GET webhook triggers execution with no secret/signature; lookup only by `webhookId` (ignores workflowId); easy remote execution trigger.
  - **Why it is a problem**: Anyone can trigger workflows; brute forcing/leak of `webhookId` becomes RCE-adjacent in automation systems.
  - **Exact fix**:
    - Change to `POST`.
    - Add `secret` to webhook row; require `Authorization: Bearer <secret>` (or HMAC signature header).
    - Query webhook with scoping: `where: { id: webhookId, workflowId }` and ensure workflow belongs to project.
    - Add rate limiting.

- **Severity: Critical**
  - **File + location**: `apps/web/action/db/credentials.ts` L1-L34
  - **Problem**: Server action `getNodeCredentials(credentials:any, projectId)` performs DB query without session/ownership check.
  - **Why it is a problem**: If callable from client, can enumerate other projects’ credentials by passing arbitrary `projectId`.
  - **Exact fix**: Fetch session inside action and verify project belongs to user before querying; tighten types and validate input.

- **Severity: High**
  - **File + location**: `apps/web/app/api/projects/[projectId]/workflow/[workflowId]/update/route.ts` L83-L96
  - **Problem**: Node `credentialId` is accepted from client and persisted without verifying it belongs to the same project.
  - **Why it is a problem**: Cross-tenant credential reference if an attacker can guess a credential ID.
  - **Exact fix**: Allowlist credential IDs for that project/user and reject out-of-scope IDs; ideally enforce DB-level constraint by scoping credential IDs per project.

## PERFORMANCE ISSUES

- **Severity: High**
  - **File + location**: `apps/web/components/editor/workflow-editor.tsx` L200-L211
  - **Problem**: Each render constructs `data.engine: { ...node }` for every node, causing ReactFlow to treat all nodes as changed and re-render heavily.
  - **Why it is a problem**: Large graphs will become sluggish; execution-state updates will re-render entire canvas.
  - **Exact fix**: Do not copy the node into `data.engine` each render.
    - Either store stable info once in node `data`, or pass minimal fields, or reference `node` directly without cloning.

- **Severity: Medium**
  - **File + location**: `apps/web/store/workflow.ts` L96-L129
  - **Problem**: `getInputsForNode` does repeated `filter/find` on edges/nodes (O(E^2)) per call; logs whole workflow.
  - **Why it is a problem**: Input panel can become slow for large graphs; console noise.
  - **Exact fix**: Precompute adjacency maps; remove `console.log` spam.

## IMPROVEMENTS (actionable)

- **Execution model hardening**
  - Add graph validation on save (server-side): detect cycles, orphan/unreachable nodes, unknown handles, multiple triggers/webhooks.
  - Persist a normalized “compiled graph” representation for fast execution.

- **Observability**
  - Standardize event payload schema using `PublishPayloadDataType` with strict enums.
  - Add `spanId/traceId` per execution and include in logs.

- **Security posture**
  - Replace webhook GET with signed POST and secret rotation.
  - Encrypt `Credential.data`.

## Implementation todos (if you want me to proceed after you accept)
