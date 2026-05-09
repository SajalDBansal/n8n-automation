# n8n-automation — Codebase Audit Report

**Date:** 2026-08-15
**Scope:** Full monorepo — `apps/web` (Next.js frontend, API routes, server actions), `packages/execution-core` (workflow execution engine), `packages/node-base` (node implementations), `packages/database` (Prisma schema/migrations), `packages/types`, `packages/validators`.
**Method:** Manual code review across five focus areas (frontend pages/actions, API/auth/security, execution engine/nodes, data layer/editor canvas, plus git history/TODO/roadmap scan). Every finding below references concrete file paths and line numbers as of this commit.

Severity legend: 🔴 **Critical** (security exposure or platform-wide breakage) · 🟠 **Bug** (incorrect behavior) · 🟡 **Missing feature** (described/implied functionality that doesn't exist or is a non-functional stub) · 🔵 **Cleanup** (dead code, typos, inconsistent style — low risk)

> **2026-08-16 update:** the auth system was migrated from NextAuth to Better Auth, fixing
> every item in §2 #1/#2/#3/#6, all of §3.1, and the Profile page bug in §3.7. See
> `docs/BETTER_AUTH_MIGRATION.md` for details on what changed and why.
>
> **2026-08-17 update:** all remaining §2 critical items are fixed — the two IDOR bugs (#4, #5),
> credential encryption at rest (#7), the per-execution concurrency limiter (#8), the AI-agent
> call timeout (#9), and the worker-mode footgun (callout). **Every item in §2 is now closed.**
> Fixed items are marked ✅ **FIXED** in place below rather than removed, so this document stays
> an accurate history.
>
> **2026-08-18 update (Stage 2):** the execution-engine correctness bugs in §3.8 are fixed —
> orphan-node handling, diamond/merge partial-failure blocking, false-SUCCESS on a failed run,
> the retry status-flapping bug, and the cancelled-batch terminal-status gap.
>
> **2026-08-18 update (Stage 3):** the core loop is now real end-to-end — the webhook trigger
> carries the actual HTTP request through to node execution and checks `Workflow.active`;
> workflows can be activated/deactivated from the editor UI; project/workflow deletes are
> gated behind a confirmation dialog; credentials have full CRUD (API route + UI) with edit,
> delete, and error toasts; and the Dashboard and `/settings` pages now show real data instead
> of stubs. See §3.2, §3.3, §3.5, §3.7, §3.9 below for the specific items closed.
>
> **2026-08-18 update (Stage 4):** the workflow editor canvas's correctness bugs are fixed —
> stale config-dialog state, the broken controlled input, parameter edits bypassing Cancel, the
> `'notice'` case mismatch, the stale-closure trigger guard, and the SSE connection leak. Undo/redo
> (keyboard + toolbar), a `beforeunload` unsaved-changes guard, and optimistic-concurrency
> save protection (409 on conflict) were added — none of these existed before. Dark-mode/copy
> cleanup landed across the node input/output panels and both executions tables. See §3.4 and
> §3.6 below.
>
> **2026-08-18 update (audit sweep):** almost everything remaining in §3.2–§3.11 and §5 is now
> closed in one pass. Highlights: **webhook signature/HMAC validation and rate limiting** are
> now live (the #1 remaining security gap from every prior update) — see §3.9; a stuck-forever
> `STARTING` execution status is fixed on both the SSE and webhook trigger paths; Agent/Telegram/
> Resend node bugs (unhandled TypeError, injection via unescaped URL params, hardcoded personal
> email fallback) are fixed; the fragile `name.includes("lmChat")` chat-model detection is
> replaced with a real type check; the expression resolver no longer silently resolves a typo'd
> variable to an empty string — it now fails that node with a clear validation error; missing DB
> indexes were added; five dead files/exports were deleted; every "Danger Zoney"/wrong-message/
> wrong-status-code/wrong-copy item across Projects, Workflows, Credentials, and the API layer
> is fixed; the description-blanks-on-load bug is fixed (required widening the shared workflow
> type through the store and API select, not just the form); and the silent
> `action/db`/`action/client` error-swallowing pattern (no `message`, no toast) is fixed
> everywhere it appeared. See §3.2–§3.11 and §5 below for the full per-item breakdown. Still
> open, deliberately not attempted in this pass because each is a separately-scoped feature
> build, not a bug fix: the conditional/branching (IF/Switch) node type, Agent tool-calling/
> memory, the standalone execution worker, the automated test suite + CI pipeline, converting
> `Node.type`/`Credential.type` to real Prisma enums (blast radius), a full repo-wide
> `console.log` sweep, full cross-route API error-shape standardization, the
> `node-config-dailog.tsx` filename typo, and in-app route-change guarding (still no built-in
> Next.js hook for it).
>
> **2026-08-18 update (Stage 5):** the testing/CI gap in §6 is closed. Three integration test
> suites now exist (`apps/web/tests/integration/`) covering the exact three areas §6 named —
> auth (sign-up, duplicate-email rejection, wrong-password rejection, archived-account session
> block), the workflow IDOR fixes (cross-account GET/DELETE/PATCH all now regression-tested
> against a live server, plus the legitimate-owner-still-works case), and workflow execution
> (a diamond-graph partial-failure case regression-testing the Stage 2 merge/false-SUCCESS fixes,
> plus a single-node happy path). `.github/workflows/ci.yml` runs `typecheck`/`lint` on every PR
> and push to `main`, plus the full test suite against a real ephemeral Postgres service
> container. Structured JSON logging (`apps/web/lib/logger.ts`) is wired into the three
> highest-value existing crash paths: the execution engine's top-level catch, the webhook
> trigger's dispatch-failure catch, and the SSE execute route's dispatch-failure catch. Two
> prerequisite bugs blocking a clean `typecheck`/`lint`/`build` were fixed along the way:
> `packages/ui`'s missing `useIsMobile` hook (§5), `packages/database`'s missing `eslint` setup,
> and a `next build`-only type error in the node-metadata route (over-narrowed dynamic route
> param type) that meant the app could not actually be built for production until now — found
> while validating the new CI pipeline, out of scope for the original audit but directly relevant
> to "does this app build." The `docker-compose.dev.yml` `POSTGRES_NAME`→`POSTGRES_DB` typo (a
> fresh `docker compose up` never created the database the app expects) is also fixed. A
> third-party error-tracking integration (Sentry) was tried and then deliberately backed out —
> see the 2026-08-18 (Stage 5, Sentry backout) note below for why. A repo-wide `console.log`→
> `logger` sweep was not attempted, same reasoning as the audit sweep's partial console.log
> cleanup in §5.
>
> **2026-08-18 update (Stage 5, Sentry backout):** a Sentry (`@sentry/nextjs`) integration was
> added per an earlier decision, then fully removed at the user's request in favor of
> console-only structured logging — no third-party error tracking in this codebase for now.
> Removed: the `@sentry/nextjs` dependency, `instrumentation.ts`/`instrumentation-client.ts`
> (existed solely to call `Sentry.init()`), the `withSentryConfig()` wrapper in
> `next.config.mjs`, and `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN` from `.env.example` and
> `turbo.json`'s `globalEnv`. `apps/web/lib/logger.ts` keeps its structured-JSON-to-console
> behavior (the part of Stage 5's original ask that didn't depend on Sentry) with the
> `Sentry.captureException`/`captureMessage` forwarding stripped out. `apps/web/app/global-error.tsx`
> is kept — a root error boundary is good practice independent of any tracking vendor — but now
> reports through `logger.error` instead of Sentry. Along the way, running Sentry's setup wizard
> (`npx @sentry/wizard`) had left `apps/web/.env.sentry-build-plugin` containing a live
> `SENTRY_AUTH_TOKEN` in plaintext and **not gitignored** — deleted, and confirmed nothing was
> ever committed. Two dead/unauthenticated example routes the wizard scaffolded
> (`/api/sentry-example-api`, `/sentry-example-page`) were also deleted. Re-verified after the
> backout: `typecheck`, `lint`, a full production build, and both non-server-dependent
> integration test suites all still pass clean.

---

## 1. Executive Summary

The product's shape is solid — the schema, editor UI, and execution engine cover the intended feature set. As of 2026-08-18, **every item in §2 (Critical Security & Stability) is fixed**, the execution engine's correctness gaps are closed (§3.8), the core product loop works end-to-end (§3.2/3.3/3.5/3.7/webhook in §3.9), the workflow editor canvas's correctness bugs are fixed with undo/redo and save-conflict protection added (§3.4), and — as of the same-day audit sweep — the webhook endpoint is signed and rate-limited, every named node-implementation bug is fixed, and the long tail of copy/message/status-code/dead-code items across §3.2–§3.11 and §5 is closed. What's left is real but lower-severity, and is now almost entirely "build a new feature" rather than "fix a bug":

1. **Two flagship features described in the README don't exist yet**: conditional/branching (IF/Switch) node type, and tool-calling/memory for the AI Agent node (§3.8, §3.9). Both are legitimate feature builds, not bug fixes — deliberately not attempted in the same pass as the rest of this sweep.
2. **The standalone execution worker still doesn't exist** — `ENABLE_WORKERS` now fails loudly instead of hanging, but the actual worker process is unbuilt (§2 callout, §7).

As of the Stage 5 pass (2026-08-18), the testing/CI gap called out above is closed — see §6.

**Counts:** 0 critical security/stability issues open (was 9) · ~4 functional bugs open (was ~19 — the audit sweep closed the remaining Telegram/Resend/API-layer/copy bugs) · ~17 missing/stubbed features open (was ~20 — the conditional/branching node and Agent tool-calling are the two big remaining ones; webhook signing/rate-limiting closed) · ~28 cleanup items open (was ~37 — five dead files/exports removed, remaining items are either high-blast-radius renames or a vague "type-drift" bullet with no concrete list to act on) (exact counts approximate — see detailed sections; see also the "Launch Runway" report for a fuller MVP-readiness breakdown, including deployment/ops gaps this audit doesn't cover).

**Recommended fix order:** With §2, §3.8's stability issues, the core loop, the editor canvas, the webhook security gap, node-implementation bugs, and now testing/CI (§6) all closed, what's left is genuinely large feature work — the conditional/branching node type and Agent tool-calling — plus the standalone worker. None of these are quick fixes; each deserves its own scoping pass rather than being bundled into a bug-fix sweep.

---

## 2. Critical Security & Stability Issues

These should be treated as immediate priorities.

| # | Issue | Location | Impact |
| --- | --- | --- | --- |
| 1 | ✅ **FIXED** — ~~OTP code returned in plaintext in the API response~~ on both signup and resend | ~~`apps/web/app/api/auth/register/route.ts:74`, `apps/web/app/api/auth/otp/resend-otp/route.ts:62`~~ | Fixed by the Better Auth migration (2026-08-16) — those routes are deleted; the `emailOTP` plugin never returns the OTP in any API response. See `docs/BETTER_AUTH_MIGRATION.md`. |
| 2 | ✅ **FIXED** — ~~Password-reset token returned in plaintext in the API response~~ | ~~`apps/web/app/api/auth/password/forgot-password/route.ts:60`~~ | Fixed by the Better Auth migration (2026-08-16) — the reset token now only ever reaches the server-side `sendResetPassword` callback and the emailed link. See `docs/BETTER_AUTH_MIGRATION.md`. |
| 3 | ✅ **FIXED** — ~~Unauthenticated endpoint dumps all users, including password hashes~~ | ~~`apps/web/app/api/health/user-list/route.ts:5`~~ | Fixed by the Better Auth migration (2026-08-16) — this route was deleted along with the rest of the old auth surface, and passwords no longer live on `User` at all. See `docs/BETTER_AUTH_MIGRATION.md`. |
| 4 | ✅ **FIXED** — ~~IDOR: any authenticated user can read/delete/rename any other user's workflow~~ | ~~`apps/web/app/api/projects/[projectId]/workflow/[workflowId]/route.ts` — `GET`, `DELETE`, `PATCH`~~ | Fixed 2026-08-17. A first attempt at this fix added `userId` directly to the `Workflow` `where` clause, which doesn't compile — `Workflow` has no `userId` column, only `projectId` (ownership is one hop away, via `Workflow.project.userId`). Corrected to a `project: { userId }` relation filter on `findFirst`/an ownership pre-check before `delete`/`update` — the same pattern the sibling `update`/`execute` routes already used correctly. Verified against the running app: a second account gets `404` on GET/DELETE/PATCH of the first account's workflow, and the row is confirmed untouched in the DB afterward. |
| 5 | ✅ **FIXED** — ~~IDOR: project overview stats and workflow-by-id readable across accounts~~ | ~~`apps/web/lib/db-calls.ts` — `getProjectOverviewStats`, `getWorkflowById`~~ | Fixed 2026-08-17, same session/root cause as #4 — `getWorkflowById`'s first-attempt fix also added a non-existent `Workflow.userId` filter (didn't compile); corrected to `project: { userId }`. `getProjectOverviewStats`'s fix (filtering `Project.findFirst` by `userId`, which *is* a real column on `Project`) was already correct as attempted. |
| 6 | ✅ **FIXED** — ~~No rate limiting anywhere on OTP or password-reset endpoints~~ | ~~`register`, `otp/resend-otp`, `otp/verify-otp`, `password/forgot-password`, `password/reset-password` routes~~ | Fixed by the Better Auth migration (2026-08-16) — Better Auth's built-in rate limiter is explicitly enabled with per-route limits; the `emailOTP` plugin's routes carry their own limits too. See `docs/BETTER_AUTH_MIGRATION.md`. |
| 7 | ✅ **FIXED** — ~~Credential secrets (API keys, OAuth tokens) stored in plaintext at rest~~ | ~~`packages/database/prisma/schema.prisma` (`Credential.data Json`), written in `.../credentials/route.ts`~~ | Fixed 2026-08-17. `Credential.data` is now AES-256-GCM encrypted (`packages/database/credential-crypto.ts`, keyed by `CREDENTIAL_ENCRYPTION_KEY`) before it's written, and decrypted at every read site that needs the real value (`get-credentials.ts`, and the inline Telegram/Resend credential fetches — the same three sites the original audit named as duplicating this lookup). The `Json` column itself didn't need to change shape — it now stores `{iv, authTag, ciphertext}` instead of the raw object. Verified against the running app: the DB row shows only ciphertext, no plaintext token. Existing credentials created before this change (if any, in a dev DB) are not migrated and will fail to decrypt — this is a from-scratch cutover, not a compatibility shim, consistent with how the Better Auth migration handled `User`. |
| 8 | ✅ **FIXED** — ~~Global concurrency limiter shared across all workflow executions platform-wide~~ | ~~`packages/execution-core/src/workflow-runner.ts:10` — `const limit = pLimit(5)` at module scope~~ | Fixed 2026-08-17 — moved to a `private limit = pLimit(5)` instance property on `WorkFlowRunner`, so each execution run gets its own 5 concurrent-node slots instead of every run on the platform sharing one global pool. |
| 9 | ✅ **FIXED** — ~~No timeout on AI-agent (Gemini) calls — a hung call blocks its node slot forever~~ | ~~`packages/execution-core/.../Agent.execute.ts` — `generateText({...})`, no `abortSignal`/timeout~~ | Fixed 2026-08-17 — added `timeout: 30_000` to the `generateText` call (the Vercel AI SDK v6's own built-in timeout option). A hung provider response is now aborted after 30s instead of occupying its concurrency slot indefinitely. |

**Also worth immediate attention (not full account-takeover, but high value/low effort):**

- ✅ **FIXED** — ~~Weak OTP randomness: `apps/web/utils/generate-otp.ts` uses `Math.random()` instead of `crypto.randomInt()`.~~ Fixed by the Better Auth migration (2026-08-16) — `generate-otp.ts` is deleted; the `emailOTP` plugin generates OTPs with crypto-safe randomness.
- ✅ **FIXED** — ~~Email enumeration on `forgot-password` (distinct error for "user does not exist" vs. success).~~ Fixed by the Better Auth migration (2026-08-16) — the page now shows the same "check your email" confirmation regardless of whether the address is registered.
- ✅ **FIXED** — ~~"Worker mode" (`ENABLE_WORKERS=true`) pushes jobs to Redis with no consumer anywhere in the repo — enabling it makes every execution hang until the client gives up. A typo (`raw === "'on"` instead of `"on"`) also means `ENABLE_WORKERS=on` silently fails to enable it in the first place.~~ Fixed 2026-08-17, partially: the typo is corrected, and `QueueExecutionEngine.execute()` now throws a clear, immediate error explaining no worker exists, instead of silently pushing to a queue that hangs the request. **The underlying missing feature — a real standalone worker — is not built**; this only converts an indefinite silent hang into a fast, clear failure. Leave `ENABLE_WORKERS` unset until the worker exists (still Stage 6 in the "Launch Runway" roadmap report).

---

## 3. Bugs by Area

### 3.1 Authentication & Account Flows

**All items in this section were fixed by the 2026-08-16 Better Auth migration** — see
`docs/BETTER_AUTH_MIGRATION.md` for what changed and why. Kept below (struck through) for
history rather than deleted.

- ✅ **FIXED** — ~~**Resend-OTP flow is completely broken end-to-end.** `resend-otp/route.ts:53` signs the JWT as `{ userId: ... }`, but `verify-otp/route.ts` and `verifyJWT` (`packages/validators/jwt/password.ts:7`) require an `id` field. Every resend-then-verify attempt fails with "Invalid token payload."~~ No more hand-signed tokens; resend is `authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" })`.
- ✅ **FIXED** — ~~**"Resend code" button on the OTP page does nothing**~~ Wired to the call above, with a loading/disabled state while in flight.
- ✅ **FIXED** — ~~**Password-reset email link is broken.** The emailed link is built as `${FRONTEND_URL}/reset-password?token=...`, but the actual page is the dynamic route `app/(auth)/reset-password/[token]/page.tsx` — no page handles the `?token=` query-string form, so clicking the real emailed link 404s.~~ `reset-password/[token]/page.tsx` → `reset-password/page.tsx` reading `?token=`, matching Better Auth's own link format.
- ✅ **FIXED** — ~~`forgot-password/page.tsx:73` — "Sign In" link points to `/login`, which doesn't exist. 404 on click.~~ Points to `/signin` now (the same wrong-route bug was also found fresh in `reset-password`'s post-reset redirect and fixed there too).
- ✅ **FIXED** — ~~OTP verification page reads `email` from the query string for display, but the only caller never passes it — the page always shows a generic "your email" message.~~ Signup now passes it as a real query param (`/verify-otp?email=...`).
- ✅ **FIXED** — ~~Inconsistent error surfacing: only `signin/page.tsx` shows a user-visible error on unexpected failure; `forgot-password`, `signup`, `reset-password`, and `verify-otp` pages all just `console.log(error)` on catch.~~ All four now show a visible error via `AuthCard`'s `error` prop, matching `signin/page.tsx`'s existing pattern.
- ✅ **FIXED** — ~~**Two fully-implemented backend endpoints have zero frontend callers**: `POST /api/auth/archive` and `POST /api/auth/password/change-password`.~~ Profile page rebuilt (see §3.7) with a working Change Password form and an Archive Account flow.
- ✅ **FIXED** — ~~Archived-account sessions aren't invalidated live: `isArchived` is only checked at login, not in the JWT/session callbacks, so an already-logged-in user who gets archived keeps a working session until natural token expiry.~~ A `databaseHooks.session.create.before` hook blocks new sessions for archived users, and the archive route calls `auth.api.revokeSessions` to kill existing ones immediately.
- ✅ **FIXED** — ~~`signin/page.tsx:18` imports the Node core module `node:console` into a client component — dead/incorrect import.~~ Removed.

### 3.2 Projects

- ✅ **FIXED** — ~~**Broken navigation**: "Open Workflows" button on project cards links to `/projects/{id}/workflows`, which doesn't exist.~~ Fixed 2026-08-18 — links to `/projects/{id}` now, matching every other link on the same card.
- ✅ **FIXED** — ~~**No confirmation dialog before deleting a project.** Both delete immediately on click.~~ Fixed 2026-08-18 — a `ConfirmDialog` (new shared component, `components/ui/confirm-dialog.tsx`) now gates both delete paths.
- ✅ **FIXED** — ~~"Danger Zoney" typo~~ (`update-project-card.tsx`).
- ✅ **FIXED** — ~~Dead imports (`User, Mail, Shield, Smartphone` from lucide-react, never used) in `projects/[projectId]/settings/page.tsx`.~~ Fixed 2026-08-18 — removed; also fixed the `ProjectSettinsPage` → `ProjectSettingsPage` typo in the same file while there.
- ✅ **FIXED** — ~~Confusingly-named exports from copy/paste: `projects/page.tsx` (the main list) exports `NewProjectsPage`; `projects/new/page.tsx` (the create form) exports `ProjectIdPage`.~~ Fixed 2026-08-18 — renamed to `ProjectsPage` and `NewProjectPage` respectively (confirmed safe: both are default exports with no cross-file references to the old names).

### 3.3 Workflows (list, detail, settings)

- ✅ **FIXED** — ~~"All Workflows" page empty state shows Projects' copy ("Group your workflows together by creating your first project") — wrong page, wrong CTA.~~ Fixed 2026-08-18 — now "No workflows yet" with copy pointing at opening a project, not creating one.
- ✅ **FIXED** — ~~Workflow executions table header reads "Project Executions... across all workflows in this project" on a page scoped to one workflow — copy/paste from the project-level page.~~ Fixed 2026-08-18 — now "Workflow Executions" / "Recent runs for this workflow." (see also §3.6).
- ✅ **FIXED** — ~~Workflow card dropdown has no Delete option (deletion is only reachable via Settings), and its "Settings" menu item is styled red/destructive despite not being destructive.~~ Fixed 2026-08-18 — added a Delete item wired to `deleteWorkflowByID` + a `ConfirmDialog`, matching `ProjectCard`'s pattern (with an `onDeleted` callback so both call sites — the global "All Workflows" page and the project detail page, each with their own local list state — stay in sync); the `text-destructive` styling moved off "Settings" onto the new Delete item where it belongs.
- ✅ **FIXED** — ~~"Danger Zoney" typo **and** wrong entity name — the workflow settings Danger Zone copy says "Permanently delete this **project**..."~~ Fixed 2026-08-18 — typo corrected and copy now says "workflow".
- ✅ **FIXED** — ~~**No confirmation dialog before deleting a workflow** — same immediate-delete pattern as projects, `handleProjectDelete` misnamed.~~ Fixed 2026-08-18 — gated behind the new shared `ConfirmDialog`, handler renamed `handleWorkflowDelete`.
- ✅ **FIXED** — ~~Editing a workflow always blanks its description field on load, regardless of the saved value.~~ Fixed 2026-08-18 — this needed more than the one-line `form.reset` fix: the shared `ProjectType.workflows`/`addWorkflow` type only ever carried `{id, name}`, so `description` had nowhere to survive. Widened the type through `packages/types`, the `/api/projects` GET select, and the `action/client/workflow.ts` optimistic helpers (which were also dropping `description` on update), then fixed the actual `form.reset` call. Verified live: created a workflow with a description via the API, confirmed it now round-trips through `GET /api/projects`.
- ✅ **FIXED** — ~~**No way to activate a workflow from the UI at all.** `setIsActive` never called, no toggle in the UI.~~ Fixed 2026-08-18 — dead state removed; the toolbar's Active/Inactive badge is now a clickable toggle (`handleToggleActive`) that PATCHes `active` and re-fetches.
- ✅ **FIXED** — ~~**Stale-closure bug in the "trigger already exists" guard.** `onDrop`'s `useCallback` dependency array omits `nodes`, even though the closure reads `nodes` to check for an existing trigger.~~ Fixed 2026-08-18 — `nodes` (and `pushHistory`, `projectId`, `workflowId`) added to the dependency array.
- ✅ **FIXED** — ~~**SSE `EventSource` leak.** `handleExecuteWorkflow` creates a new `EventSource` per execute click with no cleanup on component unmount and no de-dup against a still-open prior connection.~~ Fixed 2026-08-18 — the `EventSource` is now tracked in a ref: closed and replaced on a new execute click, and closed on component unmount via a cleanup effect.
- ✅ **FIXED** — ~~Remaining `console.log`s in execution event handlers and the `getWorkflow` catch block.~~ Fixed 2026-08-18 — the debug logs in the SSE `onopen`/`workflow-update`/`workflow-error` handlers are removed; the `getWorkflow` catch now logs via `console.error` and shows a `toast.error` (previously silent to the user beyond the console).
- ✅ **FIXED** — ~~IDOR~~ — see §2, items 4 and 5 (workflow GET/DELETE/PATCH and `getWorkflowById` now filter by ownership).
- ✅ **FIXED** — ~~Misleading API messages/status codes: workflow delete/update return `"Projects deleted successfully"` (copy/paste); the workflow list GET returns `"Workflow added successfully"`; a Zod validation failure on PATCH returns `401 Unauthorized` instead of `400`.~~ Fixed 2026-08-18 across all three routes — see §3.10 for the full list of message/status-code fixes across the API layer (this was one instance of a repeated pattern).

### 3.4 Workflow Editor Canvas

- ✅ **FIXED** — ~~**Config dialog leaks stale state between nodes.** `fetchCredentials` returns early without calling `setCredentials([])` when the newly-opened node has no credentials — the previously-opened node's credential list stays visible.~~ Fixed 2026-08-18 — the early-return path now clears the list.
- ✅ **FIXED** — ~~**Broken controlled input.** The Description field in the node settings tab binds its `value` to the original `node` prop while `onChange` writes to local `nodeData` state — the field visually appears not to accept typed input.~~ Fixed 2026-08-18 — `value` now reads from `nodeData` (the same state `onChange` writes to).
- ✅ **FIXED** — ~~**Parameter edits bypass Cancel.** Every keystroke in a parameter field writes directly into the *global* workflow store in addition to local dialog state; clicking Cancel only discards the local copy, so the global store and the canvas's own node list can diverge after a cancelled edit.~~ Fixed 2026-08-18 — parameter edits now only touch local dialog state; the global store is updated once, on Save.
- ✅ **FIXED** — ~~`'notice'` (lowercase) vs. `"NOTICE"` (actual enum value) case mismatch means the NOTICE-type property branch is dead code.~~ Fixed 2026-08-18 — corrected to `'NOTICE'`.
- 🟡 **PARTIALLY FIXED** — ~~No `beforeunload`/route-change guard.~~ Fixed 2026-08-18 for tab close/refresh/external navigation (`beforeunload` listener gated on unsaved changes). Still open: Next.js App Router has no built-in in-app route-change guard, so clicking an in-app link (e.g. the sidebar) with unsaved changes still navigates away silently — a genuine gap, not attempted.
- ✅ **FIXED** — ~~No undo/redo, no keyboard shortcuts (Delete/Backspace, Ctrl+Z) anywhere in the editor.~~ Fixed 2026-08-18 — a history/future stack in `store/editor.ts` snapshots before node/edge removal, drag-start, node-config saves, and new-node drops; wired to Ctrl/Cmd+Z (undo), Ctrl/Cmd+Shift+Z or Ctrl+Y (redo), and toolbar Undo/Redo buttons. `deleteKeyCode` explicitly set to `["Backspace", "Delete"]` on the canvas. Verified directly against the store (drag-start/continue/end collapses into one undo step; removal/connect each push a step).
- ✅ **FIXED** — ~~No concurrent-edit protection — `saveWorkflow` does a plain PATCH with no version/`updatedAt` check, so two tabs editing the same workflow silently overwrite each other.~~ Fixed 2026-08-18 — the editor sends the `updatedAt` it last loaded as `expectedUpdatedAt`; the update route rejects the save with `409` if the row has moved on since. Verified live: a second save using a now-stale `expectedUpdatedAt` is rejected and the DB retains the first save's data.
- ✅ **FIXED** (partially) — ~~No debounce on node-drag position updates — `onNodesChange` fires every pointer-move frame, and each firing re-runs a full `JSON.stringify` snapshot diff for dirty-state tracking with no throttle.~~ Fixed 2026-08-18 — the dirty-state `JSON.stringify` diff is now debounced (300ms). Position updates themselves are still applied on every frame, which is required for the drag to visually track the pointer — only the expensive snapshot comparison was throttled.
- ✅ **FIXED** (partially) — ~~Two independent, divergence-prone sources of truth for the AGENT/CHAT_MODEL connection rule: `isValidConnection` and a second filtering pass in `store/editor.ts`'s `onConnect` that also references handle types (`"memory"`, `"tool"`) the UI never actually produces.~~ Fixed 2026-08-18 — `onConnect`'s dead `"memory"`/`"tool"` branches removed, simplified to just check `"chat-model"`. The two-sources-of-truth structure itself (`isValidConnection` vs. `onConnect`) is unchanged — only the divergent extra branches were removed.
- ✅ **FIXED** — ~~`render-property.tsx` is a fully empty, unused stub component (dead file); several `property-renderer.tsx` `case` branches (`callout`, `number`, `boolean`, `textarea`) are commented out but correspond to no property type in the current type union.~~ Fixed 2026-08-18 — `render-property.tsx` deleted (confirmed zero importers); the three dead commented case branches in `property-renderer.tsx` removed, along with the now-unused `Textarea` import.
- ✅ **FIXED** — ~~Editor sidebar's "Settings" tab (Credentials / Expected Output accordions) is entirely commented out — expands to nothing.~~ Fixed 2026-08-18 — removed rather than resurrected (its accordion content was fully commented out with no real implementation behind it, and its stated purpose is superseded by the node-config dialog); the sidebar is now just the single Actions panel it was already defaulting to.
- ✅ **FIXED** — ~~`node-input-panel.tsx` / `node-output-panel.tsx` hardcode light-theme classes, breaking in dark mode.~~ Fixed 2026-08-18 — both, plus the remaining light-only classes in `node-config-dailog.tsx`, moved to theme tokens (`text-foreground`, `text-muted-foreground`, `bg-muted`, `border-border`, etc.).

### 3.5 Credentials

- ✅ **FIXED** — ~~Wrong empty-state copy: the project Credentials tab shows "No **executions** found for this project" (copy/paste).~~ Fixed 2026-08-18 as part of the page rewrite.
- ✅ **FIXED** — ~~**"Add credential" button on the global Credentials page goes nowhere** — `<Link href={""}>`.~~ Fixed 2026-08-18 — opens the new `CredentialTypePicker` → `CredentialConfigDialog` create flow.
- ✅ **FIXED** — ~~**"Add Credentials" button on the project Credentials tab has no handler at all.**~~ Fixed 2026-08-18 — wired to the same type-picker/config-dialog create flow, scoped to the project.
- ✅ **FIXED** — ~~The "..." row menus on both the global and project credentials tables are decorative — no edit/delete action wired up; no `GET/PATCH/DELETE /credentials/[credentialId]` API route at all.~~ Fixed 2026-08-18 — new `app/api/projects/[projectId]/credentials/[credentialId]/route.ts` (GET metadata, PATCH re-encrypts changed fields, DELETE blocked with 409 if still referenced by a node); row menus now trigger real edit (config dialog in edit mode) and delete (`ConfirmDialog`).
- ✅ **FIXED** — ~~The credential config dialog's "Details" tab renders nothing.~~ Fixed 2026-08-18 — shows the credential's type, name, and (for an existing credential) created/updated timestamps, fetched from the metadata-only GET route; no secret values rendered.
- ✅ **FIXED** — ~~Credential save failures are silent — `handleSave` only `console.error`s, no toast/inline error shown to the user.~~ Fixed 2026-08-18 — save/edit/delete paths now surface `toast` errors.
- ✅ **FIXED** — ~~Secrets stored in plaintext~~ — see §2, item 7 (now AES-256-GCM encrypted at rest).
- ✅ **FIXED** — ~~`type: z.string()` on credential creation accepts any string, not restricted to real supported credential types.~~ Fixed 2026-08-18 — now `z.enum(["telegramApi", "resendApi", "googleGeminiApi"])`, kept in sync by hand with `NodeCredentialsName` (`packages/validators` can't depend on `@workspace/types` for a compile-time check here — `@workspace/types` already depends on `@workspace/validators` for its zod-inferred form types, so the reverse edge would create a circular package dependency; this was actually tried and reverted after `bun`/Turbopack flagged the cycle at dev-server startup).

### 3.6 Executions

- This is the most solidly-built area of the app — pagination, filters, and auto-refresh for running executions all work correctly (`apps/web/hooks/use-executions.ts`).
- ✅ **FIXED** — ~~Dark-mode inconsistency: both executions tables hardcode light-theme Tailwind classes (`bg-gray-50`, `text-gray-900`, etc.) instead of theme tokens — these render as a bright white block in dark mode.~~ Fixed 2026-08-18 in both the project-level and workflow-level executions tables (credentials tables were already fixed in Stage 3).
- ✅ **FIXED** — ~~Off-brand orange "Load more" button instead of the app's primary color.~~ Fixed 2026-08-18 — dropped the orange override, now uses the standard `outline` button style.
- ✅ **FIXED** — ~~`workflows/executions-table.tsx:149` uses array `index` as the React `key` instead of `execution.id`.~~ Fixed 2026-08-18 — now keys on `execution.id`, matching the project-level page. While in there: the wrong "Project Executions... across all workflows" copy on this workflow-scoped table (flagged in §3.3) was also fixed.

### 3.7 Dashboard / Settings / Profile

- ✅ **FIXED** — ~~**Dashboard is entirely stubbed.** All three widgets — KPI stat cards, recent-executions table, system health — render hardcoded/static data. "All systems operational" is always shown regardless of real state.~~ Fixed 2026-08-18 — `dashboard/page.tsx` is now an async server component backed by `getDashboardOverviewStats()`/`getRecentExecutions()` (`lib/db-calls.ts`); System Health now polls the rewritten `/api/health` route, which actually checks Postgres (`SELECT 1`) and Redis (`ping()`) instead of returning a hardcoded OK.
- ✅ **FIXED** — ~~**Settings page (`/settings`) is a literal placeholder** — `return <div>Settings page route : /settings</div>`.~~ Fixed 2026-08-18 — real page with a working Appearance/theme selector (light/dark/system via `next-themes`) and an Account card linking to Profile.
- ✅ **FIXED** — ~~**Profile page renders the wrong form entirely.** `update-user-profile-card.tsx` (rendered at `/profile`) is a verbatim copy of the create-project card: Project Name / Type / Description fields, and its submit handler calls `createProjectOptimistic(...)` and redirects to `/projects`.~~ Fixed as part of the 2026-08-16 Better Auth migration — rebuilt with real name/email/avatar fields (`authClient.updateUser()`), a working Change Password form, and an Archive Account flow with password re-entry. See `docs/BETTER_AUTH_MIGRATION.md`.
- ✅ **FIXED** — ~~On the same page: "Change password" and "Enable 2FA" buttons have no `onClick`; "Last changed 3 months ago" is hardcoded fake text; the Danger Zone delete-account button's `onClick` is commented out.~~ Change Password and Archive Account are now wired and working; "Enable 2FA" is disabled and labeled "Coming soon" (2FA itself is still not implemented — not in scope for the auth migration) instead of silently doing nothing; the fake "Last changed" text was removed.

### 3.8 Execution Engine (`packages/execution-core`)

- ✅ **FIXED** — ~~Global concurrency limiter and missing AI-call timeout~~ — see §2, items 8–9.
- ✅ **FIXED** (partially) — worker mode now fails loudly instead of hanging silently — see §2 callout. The worker process itself is still not built.
- ✅ **FIXED** — ~~**A single disconnected/orphan node fails the entire workflow run**, rather than being skipped — `buildGraph()` throws if *any* node has no edge at all.~~ Fixed 2026-08-18 — an isolated `TRIGGER`/`WEBHOOK` node (a valid single-node workflow) still runs; any other node with zero edges is now skipped with a warning instead of failing the whole run.
- ✅ **FIXED** — ~~**Diamond/merge graph shapes are broken on partial failure.** If node A fans out to B and C, which both feed D, and B fails, `markBranchBlocked` marks the *entire* downstream subtree (including D) as blocked — even though C might still succeed.~~ Fixed 2026-08-18 — replaced the eager subtree-walk with per-node parent-count tracking (`settleNode`/`markNodeBlocked`): a merge node is only blocked once *every* parent has failed or been blocked; a live sibling branch keeps it eligible to run. Verified live: in a T→B,T→C,B→D,C→D graph with B failing validation, D still executes and succeeds.
- ✅ **FIXED** — ~~**A single node's parameter-validation error cancels the whole workflow run**, not just that node/branch — `shouldCancelFlow` is set to `true` for ordinary validation failures (e.g., Telegram missing `chatId`), not just structural graph errors like cycles.~~ Fixed 2026-08-18 — `shouldCancelFlow: true` is now only set by structural graph errors caught in `buildGraph()`/`validateGraph()` before execution starts (self-loop, invalid edge, no start nodes, non-trigger entry, cycle). Per-node validation/system errors during execution (Telegram params, Agent chat-model count/registration) no longer cancel the run — they fail or block only their own branch. As a direct consequence, a run that completes with any node failed/blocked now correctly reports `ERROR` overall instead of a false `SUCCESS` — previously, any non-cancelling failure was silently absorbed and the run still reported success.
- ✅ **FIXED** — ~~**Status "flapping" on retry.** A node that fails once and then succeeds on a retry emits a `FAILED` SSE event before the later `SUCCESS` event.~~ Fixed 2026-08-18 — `executeNode()` had its own catch block publishing a FAILED status on *every* attempt, including ones about to be retried; removed it. `executeNodeWithRetries()` is now the sole place that publishes a node's status, only once the outcome is actually final. (While in there: non-retryable EXECUTION/SYSTEM failures previously published no status at all for that node — now fixed too.)
- ✅ **FIXED** — ~~In-flight nodes from the same concurrent batch get no terminal status when a run is cancelled mid-batch — their promises settle after the run's own `CANCELLED`/`ERROR` status has already been published.~~ Fixed 2026-08-18 — the per-node `Promise.all` callback no longer throws on `shouldCancelFlow`; it returns a result like any other failure, so the whole batch is awaited and every sibling gets its own terminal status published before the run-level cancellation is decided and thrown. (Note: after the validation-cancels-whole-run fix above, `shouldCancelFlow` is now rarely reachable during actual node execution at all — mainly a genuine "node not found" engine-consistency case — but the fix holds for whenever it does happen.)
- 🟡 **No conditional/branching (IF/Switch) node type exists at all**, despite the README describing "branching logic" and "conditional paths" as core to the product. Every non-agent edge is unconditional. Genuinely unaddressed — this is a new node type plus a multi-output edge model change in the engine, a real feature build, not a bug fix; deliberately out of scope for the 2026-08-18 audit sweep.
- ✅ **FIXED** — ~~Expression resolver stringifies object/array values as `"[object Object]"` when embedded in a larger template string (only whole-string expressions preserve type).~~ Fixed 2026-08-18 — an object/array resolved inside a larger template is now `JSON.stringify`'d instead of `String()`'d.
- ✅ **FIXED** — ~~Unresolved variables silently resolve to `null`/`""` (only `console.warn`'d) instead of failing the node — a typo'd node reference produces a blank parameter rather than a clear error.~~ Fixed 2026-08-18 — all five silent-`null` sites in `resolveExpression` now throw a new `UnresolvedExpressionError` instead; the call site in `workflow-runner.ts` catches it and turns it into a per-node `VALIDATION` error, consistent with how other node-level validation failures are handled (fails only that node/branch, not the whole run). This closes the concrete footgun named in the original §3.9 Resend finding below: a typo'd expression in a `to` field used to silently resolve to `""` and then trip the hardcoded-fallback bug.
- ✅ **FIXED** — ~~Dead duplicate 717-line copy of the entire `WorkflowRunner` sitting in `packages/execution-core/src/new-file.ts`, unused and unexported.~~ Fixed 2026-08-18 — deleted (confirmed zero importers via repo-wide grep first). Its `type === "CHAT_MODEL"` chat-model-detection fix (already correct there, unlike the live file) was harvested into `workflow-runner.ts` before deletion — see §3.9.

### 3.9 Node Implementations

- 🟡 **Agent node has no tool-calling or memory support** despite being the flagship AI feature — `Agent.execute.ts` calls plain `generateText({ model, prompt })` with no `tools` argument, and the node's parameter schema only defines a single `prompt` field. The editor has dead validation code referencing "tool"/"memory" connections that the UI never actually produces. Genuinely unaddressed — needs AI SDK tool definitions plus a way to attach "tool" nodes to an Agent; a real feature build, deliberately out of scope for the audit sweep.
- ✅ **FIXED** — ~~Agent node throws an unhandled `TypeError` if `prompt` is non-string/undefined.~~ Fixed 2026-08-18 — validates `typeof prompt === "string"` before calling `.trim()`, returns a clear validation error instead. While in there: the node's `timeout: 30_000` option on `generateText` wasn't actually a real option in `ai` v6 (silently ignored) — replaced with the real `abortSignal: AbortSignal.timeout(30_000)`.
- ✅ **FIXED** — ~~**Telegram node: unescaped user text/chatId interpolated directly into the request URL** — no `encodeURIComponent`, so `&`, `#`, `%` in a message breaks the request or injects extra query parameters into the Telegram API call.~~ Fixed 2026-08-18 — both `chatId` and `text` are `encodeURIComponent`'d before being placed in the URL.
- ✅ **FIXED** — ~~Telegram node has no null-check on the fetched credential before use — a missing credential becomes the literal string `"undefined"` in the bot-token URL instead of a clear validation error.~~ Fixed 2026-08-18 — returns a clear "Telegram credential not found or invalid" error instead.
- ✅ **FIXED** — ~~**Resend (email) node has a hardcoded personal email as a silent fallback recipient** (`to: to || ["sajaldutt.bansal@gmail.com"]`) plus hardcoded mock `from`/`subject`/`html` defaults, duplicated byte-for-byte in two files.~~ Fixed 2026-08-18 — all four hardcoded fallbacks removed from `resend-function.ts`; a falsy field now fails loudly at the Resend API rather than silently mailing the developer's own address. The byte-identical duplicate file (`packages/node-base/nodes/Resend/resend-function.ts`, confirmed zero importers) is deleted — only the one actually wired into `execution-core` remains.
- ✅ **FIXED** — ~~Resend node does no per-field validation despite `from`/`to`/`subject`/`html` being marked `required: true` in its metadata — only checks the parameters object isn't falsy.~~ Fixed 2026-08-18 — `Resend.execute.ts` now checks all four required fields are present as non-empty strings before ever constructing the email service, returning a clear "Missing required field(s): ..." error. This also closes a latent crash: with `to` missing, `(parameters.to as string).split(",")` would previously throw an uncaught `TypeError` (the function had no try/catch at all).
- ✅ **FIXED** — ~~**Fragile chat-model detection via `name.includes("lmChat")`** instead of the more robust `type === "CHAT_MODEL"` check used elsewhere.~~ Fixed 2026-08-18 — both sites in `workflow-runner.ts` (`executeNode`'s skip check, and `getConnectModel`'s model-lookup filter) now use `type === "CHAT_MODEL"`. The dead `new-file.ts` (see §3.8) already had this fix; harvested from there before deleting it.
- ✅ **FIXED** — ~~**Webhook trigger discards the incoming HTTP request entirely.** Only `GET` is implemented, body/query/headers never read, execution output is the node's static config rather than the real payload.~~ Fixed 2026-08-18 — the route now exports a shared `handleWebhookTrigger` for `GET/POST/PUT/PATCH/DELETE/HEAD`, captures body/query/headers into a `WebhookTriggerPayload`, and threads it through `ExecutionPayload`/`WorkflowRunner` so the webhook node's execution output is the real triggering request, stored on the `Execution` row.
- ✅ **FIXED** — ~~Webhook route never checks `Workflow.active` before executing. There's also no `Webhook`-level enabled/disabled flag in the schema, and no signature/HMAC validation or rate limiting on the public trigger endpoint (open resource-exhaustion vector).~~ Fully closed 2026-08-18 (was partially fixed 2026-08-17 for just the active check):
  - **Signature validation**: `Webhook.secret` (new nullable column, generated via `crypto.randomBytes(32)` on first creation) is required as an HMAC-SHA256 signature (`x-webhook-signature: sha256=<hex>` over the raw request body) once set; missing/invalid → `401`. Pre-existing webhooks (secret still null) stay unsigned until the first time their docs panel is viewed in the editor, at which point a secret is lazily generated and enforcement begins — a real closing of the gap for old webhooks, not a permanent carve-out. Also fixed in the same change: the workflow-save route was deleting and recreating the `Webhook` row on *every* save, which would have silently invalidated the secret each time — changed to `upsert` so an existing secret survives a save. The secret + an example signed `curl` command are shown in the Webhook node's Docs tab (new `GET .../webhook/[webhookId]/secret` authenticated route, distinct from the public trigger route).
  - **Rate limiting**: new `apps/web/lib/webhook-rate-limit.ts`, a simple in-memory sliding-window limiter (30 req/min per webhook), checked before any DB work. In-memory only — same known single-instance limitation as Better Auth's own rate limiter and the in-memory SSE pub/sub elsewhere in this app; documented, not hidden.
  - Also fixed in the same pass: the entire route is now wrapped in try/catch with a consistent `{success, message}` response shape (was `{error}`); a `HEAD` request no longer creates a real `Execution` row; the route's `workflowId` URL segment is now validated against the webhook's actual `workflowId` instead of being silently ignored.
  - Verified live end-to-end: created a workflow with a webhook node, confirmed a request with no/wrong signature gets `401`, a correctly-signed request gets `200` and the real payload lands on the `Execution` row, and the 31st request within a minute gets `429`.
- ✅ **FIXED** — ~~`GoogleGeminiApi.credentials.ts`'s connection-test handler always returns `{status: "OK"}` regardless of whether the key is actually valid.~~ Fixed 2026-08-18 — now calls Gemini's `models` list endpoint with the provided key and reports the real result. Note: there is still no "Test Connection" button anywhere in the UI that actually invokes this handler — fixing the dishonest logic is what the audit asked for, but wiring a trigger for it is new scope, not named in the original finding, and wasn't added.
- 🔵 Inconsistent credential-fetch pattern: a clean, reusable `getCredentials()` helper exists but only the Gemini node uses it; Telegram and Resend each duplicate their own inline Prisma query. Not touched in this pass (low risk, cosmetic duplication) — the null-check gap this used to also cause for Telegram is now fixed directly in Telegram's own copy, above.
- ✅ **FIXED** — ~~`GmailOAuth2Api` credential type is fully defined and registered but has no corresponding Gmail node anywhere — dead credential type.~~ Fixed 2026-08-18 — removed entirely (credential definition file, its registration in `packages/node-base`'s registry, and its member in the `NodeCredentialsName` union), which also removes the dead "Gmail OAuth2 API" option from the credential-type picker UI.
- ✅ **FIXED** — ~~Resend node execution logs full email content and API response to stdout.~~ Fixed 2026-08-18 — removed as part of the hardcoded-fallback fix above; only a genuine send failure is now logged (via `console.error`, error message only, no content).

### 3.10 API Layer (cross-cutting)

- 🔵 **PARTIALLY FIXED** — ~~Inconsistent error response shape across routes — most use `{ success: false, message }`, but the webhook route uses `{ error: "..." }` and SSE error frames use yet another shape.~~ The webhook route (§3.9) now uses the standard `{success, message}` shape. Still open: a full sweep of every route plus the SSE frame shape is a larger, separate cleanup not attempted here.
- ✅ **FIXED** — ~~`projects/[projectId]/route.ts` PATCH: the `if (!project)` fallback branch is unreachable dead code, because Prisma's `update` throws `P2025` rather than returning `null` on a non-matching compound `where` — cross-user updates fall through to a generic `500` instead of a proper `401/404`.~~ Fixed 2026-08-18 — dead branch removed; the catch now checks for Prisma's `P2025` error code and returns `404` directly. Also fixed in the same route: DELETE/PATCH both said "Projects deleted successfully" regardless of which operation ran — now "Project deleted successfully" / "Project updated successfully"; `request.json()` is now wrapped in try/catch (was previously unguarded, so malformed JSON threw unhandled).
- ✅ **FIXED** — ~~`executions/route.ts` returns `401` instead of `404` for a genuinely missing project.~~ Fixed 2026-08-18.
- ✅ **FIXED** — ~~**Execution can get stuck permanently in `STARTING` status.** The `Execution` row is created before `executionEngine.execute()` runs; if that call throws or the SSE stream's outer catch fires, nothing ever updates the row's status.~~ Fixed 2026-08-18 in both places this can happen — the SSE `execute/route.ts` catch and the webhook trigger route's dispatch catch both now call `updateExecutionStatusInDB(executionId, "ERROR", true)` (newly exported from `@workspace/execution-core`) before returning, so a dispatch failure reports `ERROR` instead of hanging at `STARTING` forever. While in there: the SSE route's catch was also emitting an *unnamed* `data: ...` frame — the client only listens for a named `workflow-error` event, so a pre-run dispatch failure was previously completely silent to the user; the frame is now correctly named.
- ✅ **FIXED** — ~~Webhook route's initial `findFirst` and the surrounding `$transaction` aren't wrapped in try/catch (only the later `executionEngine.execute()` call is) — a DB error here produces a raw, unshaped 500.~~ Fixed 2026-08-18 — the entire handler is now wrapped in one try/catch (see §3.9 for the full webhook-route rewrite).
- 🟠 Two more message/status-code bugs found and fixed in the same 2026-08-18 sweep, not separately named in the original audit: `workflow/route.ts` and `credentials/route.ts` GET both returned `401`/"Unauthorized Request" for a missing project (now `404`/"Project not found") and both said "Workflow added successfully" on a `GET` (now "fetched"); `app/api/workflows/route.ts` said "Projects fetched successfully" on the all-workflows endpoint (now "Workflows fetched successfully"); `workflow/[workflowId]/route.ts` PATCH returned `401` for both a Zod validation failure and an id mismatch (now `400` for both, matching the correct pattern already used in the sibling project route).

### 3.11 Data Layer (schema, types, validators)

- ✅ **FIXED** — ~~Missing DB indexes on `Edge.source`/`Edge.target` and `Node.credentialId` — graph-traversal and credential-usage lookups do full table scans as data grows.~~ Fixed 2026-08-18 — `@@index([source])`/`@@index([target])` added to `Edge`, `@@index([credentialId])` added to `Node`; migration generated and applied, indexes confirmed present via `\d "Edge"`/`\d "Node"`.
- 🔵 `Node.type` and `Credential.type` are plain `String` columns rather than Prisma enums (unlike `Execution.status`), so the DB doesn't enforce valid `NodeType`/credential-type values — only app-level checks do. Deliberately deferred, not attempted — converting these touches every string-literal usage of these fields across `node-base`, `execution-core`, and `apps/web`, a much higher blast radius than the rest of this sweep.
- ⚠️ **Risky migration pattern**: `20260426150007_spellcheck_webhook` renames the `webhook` table to `Webhook` via drop-and-recreate rather than `ALTER TABLE ... RENAME`, which would have destroyed any pre-existing webhook rows in an environment that had them. Worth using `RENAME` for future table/column renames. Historical — can't be fixed retroactively, no action taken; the new 2026-08-18 index/webhook-secret migration correctly used additive `ALTER TABLE` statements, not drop-and-recreate.
- ✅ **FIXED** — ~~Dead/drifted `UserSchema` zod validator (`packages/validators/zod/user.ts`) references a `name` field that doesn't exist on the `User` model (`userName` is correct) — unused anywhere in the codebase, but a trap if someone reaches for it.~~ Fixed 2026-08-18 — deleted, along with its re-export from `packages/validators/index.ts` (confirmed zero importers first).
- 🔵 Multiple smaller type-drift issues between the Prisma schema, `packages/types`, and `packages/validators` (optional vs. required fields not matching DB nullability). The one concrete example named in the original finding — the stale `icon` casing comment on `Project.icon` in `schema.prisma` — is fixed 2026-08-18 (corrected to `"ICON" | "IMAGE"`, matching the real values used by `createProjectZodSchema`). The rest of this bullet was never itemized beyond "see the data-layer audit for the full list" — no concrete list exists to act on, so it's left open rather than guessed at.

---

## 4. Missing / Not-Yet-Implemented Features

> This section was written 2026-08-15 and, unlike §2–§3, was never updated across the four
> stages of fixes or the 2026-08-18 audit sweep that followed them — most of the list below is
> now stale. Corrected in place below rather than silently left wrong.

Grouped by how close each is to "exists but not wired up" vs. "doesn't exist at all":

**Exists on the backend, but has no working UI:**

- ✅ **DONE** — ~~Change password (`/api/auth/password/change-password`)~~ — wired to the Profile page's Change Password form as part of the Better Auth migration (2026-08-16).
- ✅ **DONE** — ~~Account archival/deletion (`/api/auth/archive`)~~ — wired to the Profile page's Archive Account flow, same migration.
- ✅ **DONE** — ~~OTP resend (endpoint itself is also broken — see §3.1)~~ — moot: OTP verification was removed entirely in favor of plain email+password signup (explicit product decision, not a fix).

**Exists in the schema/type system, but no UI to use it:**

- ✅ **DONE** — ~~Workflow activate/deactivate toggle~~ — added to the editor toolbar (Stage 3, 2026-08-18).
- ✅ **DONE** — ~~Credential edit/delete (no API route for it either)~~ — full CRUD route + UI added (Stage 3, 2026-08-18).
- ✅ **DONE** — ~~Per-project "Add Credential" from the Credentials tab~~ — wired (Stage 3, 2026-08-18).

**Doesn't exist anywhere yet:**

- ✅ **DONE** — ~~Real dashboard data (KPIs, recent executions, system health)~~ — Stage 3, 2026-08-18.
- ✅ **DONE** — ~~User profile view/edit (name, email, avatar)~~ — Better Auth migration, 2026-08-16.
- 🟡 Two-factor authentication (button exists, nothing behind it) — still genuinely not implemented; the button is now honestly disabled and labeled "Coming soon" (2026-08-16) instead of silently doing nothing, but 2FA itself was never in scope for any stage so far.
- 🟡 **Conditional/branching (IF/Switch) node type** — still not implemented. A real feature build (new node type + multi-output edge model), not a bug fix — see §3.8.
- 🟡 **Tool-calling / memory for the AI Agent node** — still not implemented, same reasoning — see §3.9.
- ✅ **DONE** — ~~Webhook triggers that actually receive their request payload, and support methods other than GET~~ — Stage 3, 2026-08-18; signature validation and rate limiting added on top in the audit sweep the same day — see §3.9.
- ✅ **DONE** (mostly) — ~~Rate limiting anywhere in the API~~ — Better Auth's own routes have it (2026-08-16); the public webhook trigger endpoint has it (2026-08-18, in-memory/single-instance). The rest of the API surface (project/workflow/credential CRUD routes) still has none — session auth gates them, but there's no per-route throttle.
- ✅ **DONE** — ~~Credential encryption at rest~~ — Stage/§2 fix, 2026-08-17 (AES-256-GCM).
- 🟡 A working standalone execution worker (the README's own roadmap item) — still not built. `ENABLE_WORKERS` now fails loudly instead of hanging (2026-08-17), which is a stability fix, not the worker itself.
- ✅ **DONE** — ~~Undo/redo and keyboard shortcuts in the editor~~ — Stage 4, 2026-08-18.
- ✅ **DONE** (partially) — ~~Unsaved-changes navigation guard~~ — `beforeunload` added for tab close/refresh (Stage 4, 2026-08-18). In-app route-change guarding (e.g. a sidebar link click) is still open — no built-in Next.js App Router hook for it.
- ✅ **DONE** — ~~Concurrent-edit protection on workflow save~~ — Stage 4, 2026-08-18 (`expectedUpdatedAt` + `409` on conflict).
- ✅ **DONE** — ~~Delete-confirmation dialogs (projects, workflows)~~ — Stage 3/4, 2026-08-18; extended to workflow cards' dropdown menu (which previously had no Delete option at all) in the 2026-08-18 audit sweep.
- ✅ **DONE** — ~~Automated tests of any kind, and a CI pipeline~~ — Stage 5, 2026-08-18. See §6.
- ⚠️ `.env.example` documents Resend API key + core infra vars, but not a Gemini or Telegram key — **this finding was based on a misunderstanding, corrected here rather than "fixed."** Gemini/Telegram/Resend-node credentials are entered per-credential through the UI (encrypted in the `Credential` table), not via global env vars — there is no `GOOGLE_GEMINI_API_KEY`/`TELEGRAM_BOT_TOKEN` env var for the app to read in the first place. The `RESEND_API_KEY` that *is* in `.env.example` is for the app's own transactional email (password reset), unrelated to the Resend node's per-credential key. No env vars were added, since none are missing.

---

## 5. Code Health / Cleanup

Low-risk but worth a pass, especially since a recent commit ("Commented or removed unnecessary console logs") shows this is already an active concern:

- 🔵 **PARTIALLY FIXED** — ~~~128 remaining `console.log`/`console.error`/`console.warn` calls across `apps/web` and `packages`.~~ The specific ones named throughout §3 (workflow-editor's load-failure and SSE-listener logs, `action/db/credentials.ts`'s error log, several `console.error("Error in creating X")`-style mislabeled ones fixed alongside their message/status-code bugs) are cleaned up as part of the 2026-08-18 sweep. A full repo-wide sweep of the rest was deliberately not attempted — touching ~120 more call sites across files this pass didn't otherwise need to open raises regression risk for a purely cosmetic issue.
- ✅ **FIXED** — ~~**Dead files**: `packages/execution-core/src/new-file.ts` (717-line duplicate engine), `apps/web/components/editor/render-property.tsx` (unused stub), `packages/node-base/nodes/Resend/resend-function.ts` (duplicate of the one actually used in `execution-core`), unused `UserSchema` validator.~~ Fixed 2026-08-18 — all four deleted (each confirmed zero-importer via repo-wide grep first; `new-file.ts`'s one useful fix — correct `CHAT_MODEL` detection — was harvested into the live file before deletion). Also removed in the same pass: the dead `GmailOAuth2Api` credential type (§3.9) and `action/client/project.ts`'s empty `getProjectById` stub.
- ✅ **FIXED** — ~~**Copy/paste artifacts**: "Danger Zoney" typo (twice), "Actice Workflows Available" typo, `action/db/workflow.ts` and `action/db/project.ts` returning `"project created successfully"` as the success message for nearly every operation regardless of what it does, wrong empty-state copy in three separate places, wrong entity names in Danger Zone descriptions.~~ All fixed 2026-08-18 — see §3.2/3.3 for the Danger Zone/entity-name fixes, §3.6 for the empty-state copy, and below for the `action/db/*.ts` message fix. "Actice Workflows Available" → "Active Workflows Available" (`utils/base-data.tsx`, 2 occurrences).
- ✅ **FIXED** — ~~**Systemic error-handling gap**: `action/db/*.ts` catch blocks return `{ success: false, error }` with no `message` field, while callers do `throw new Error(res.message)` — this throws `Error("undefined")` and the real error is lost. The optimistic `action/client/*.ts` wrappers roll back state on failure via `console.error` only, with no toast.~~ Fixed 2026-08-18 across both files — every `action/db/workflow.ts` and `action/db/project.ts` function now extracts a real message from the axios error (response body message, falling back to the axios error message, falling back to a generic string) and returns it as `message`; every `action/client/workflow.ts` and `action/client/project.ts` function now reads `res.message` instead of casting `res.error` to a string, and surfaces failures via `toast.error` in addition to `console.error`. Also fixed in the same pass: `createWorkflowOptimistic` previously had no rollback of its optimistic `addWorkflow` call on failure at all (the optimistic node would stay in the UI even after a confirmed server-side failure) — now rolls back like its siblings.
- ✅ **FIXED** — ~~**Dark-mode inconsistency**: several tables (executions, credentials) and editor panels hardcode light-theme Tailwind classes instead of theme tokens, breaking visibly in dark mode.~~ Fixed across Stage 3 (credentials tables), Stage 4 (node input/output panels, node-config dialog, both executions tables), and the 2026-08-18 sweep (the credential config dialog's remaining `text-gray-*` classes).
- ✅ **FIXED** — ~~Leftover boilerplate from whatever template this project was bootstrapped from: `header.tsx` references `habits`/`create-habit` routes that don't exist in this app.~~ Fixed 2026-08-18 — both dead entries removed from `header.tsx`'s breadcrumb-label map.
- 🔵 Filename typo: `node-config-dailog.tsx`. Deliberately not renamed — every import site (several files) would need updating for a purely cosmetic fix; too high a blast radius for the value, consistent with how this file's own established filename has been left alone through every prior stage of work.

---

## 6. Testing & CI Gaps

- ✅ **FIXED** — ~~Zero test files (`*.test.ts`, `*.test.tsx`, `*.spec.ts`) exist anywhere in the repo.~~ Fixed 2026-08-18 (Stage 5). Three `bun test` suites in `apps/web/tests/integration/`: `auth.test.ts` (sign-up, duplicate-email rejection, wrong-password rejection, archived-account session block — calls Better Auth's `auth.api.*` directly, no server needed), `workflow-idor.test.ts` (the §2 #4/#5 IDOR fixes — cross-account GET/DELETE/PATCH all assert `404` + row-untouched, plus the legitimate owner still gets `200`; needs a running server since the ownership check lives in the route handler itself), and `workflow-execution.test.ts` (calls `runWorkflowExecution` directly — a diamond-graph partial-failure case regression-testing the Stage 2 merge/false-SUCCESS fixes, plus a single-node happy path). Not a full coverage sweep — deliberately scoped to the highest-risk paths this report itself flagged.
- ✅ **FIXED** — ~~No CI configuration — no `.github/workflows` directory, so `lint`/`typecheck`/`build` (all defined as turbo scripts) never run automatically on push or PR.~~ Fixed 2026-08-18 (Stage 5). `.github/workflows/ci.yml`: a `static-checks` job (`typecheck` + `lint`) on every PR and push to `main`, and a `test` job running the full integration suite against a real ephemeral `postgres:16` service container (migrations applied, dev server started and polled, then `bun run test`). Two prerequisite script failures this surfaced (`packages/ui` typecheck, `packages/database` lint) were fixed first — wiring CI to already-broken scripts would have defeated the point.
- ✅ **DONE** — ~~Even a minimal CI step running `bun run typecheck && bun run lint` on every PR, plus a handful of auth-flow integration tests, would have caught a meaningful fraction of these before merge.~~ Now in place, as above.
- Structured JSON logging (`apps/web/lib/logger.ts`) was added alongside the above, wired into the three highest-value existing catch blocks (execution engine top-level crash, webhook dispatch failure, SSE dispatch failure) — this wasn't a named gap in the original audit but directly supports "catch regressions before they reach users." A Sentry integration was tried on top of this and then deliberately removed at the user's request (see the Stage 5 Sentry-backout update note at the top of this document) — there is currently no third-party error-tracking service wired into this app, by choice, only console-based structured logging.

---

## 7. Roadmap Context (from README)

The README's own "Roadmap & TODOs" section lists one in-progress item:

> **Standalone Execution Engine (Worker)** — decouple execution from the live client connection via a Redis-backed job queue and a standalone Node.js worker service, so scheduled/cron and external-webhook triggers work without an active UI session.

Current state (per §3.8/§2): the client-facing half of this (pushing a job to Redis when `ENABLE_WORKERS=true`) exists, but **the worker half does not exist anywhere in the repo** — no consumer ever reads from the queue. Today, enabling worker mode doesn't get you partway to the roadmap goal; it silently breaks execution (requests hang until the client gives up). This should be treated as "not started" rather than "in progress," and the queue-push code path should probably be left disabled until the worker exists.

---

## Suggested Priority Order

1. ~~§2 items 1–9~~ — **done as of 2026-08-17.** Auth/IDOR/secrets and both execution-engine stability issues are fixed; see the update notes at the top of this document.
2. ~~Profile page (§3.7)~~ — **done as of 2026-08-16**, as part of the Better Auth migration.
3. ~~Execution-engine correctness (§3.8: orphan nodes, diamond/merge blocking, false-SUCCESS, retry flapping, cancelled-batch statuses)~~ — **done as of 2026-08-18.**
4. ~~Core loop completeness (§3.2, §3.3, §3.5, §3.7, webhook payload/active-check in §3.9)~~ — **done as of 2026-08-18.** Webhook trigger now carries the real request; workflows can be activated/deactivated; project/workflow deletes are confirmed; credentials have full CRUD; Dashboard and `/settings` show real data.
5. ~~Editor canvas correctness (§3.4: stale config-dialog state, broken controlled input, Cancel-bypass, notice case mismatch, stale-closure trigger guard, SSE leak) plus undo/redo, `beforeunload` guard, and concurrent-edit save protection~~ — **done as of 2026-08-18.**
6. ~~Webhook signature/HMAC validation + rate limiting (§3.9), the remaining named node-implementation bugs (Agent, Telegram, Resend, chat-model detection), and the long tail of copy/message/status-code/dead-code items across §3.2–§3.11 and §5~~ — **done as of 2026-08-18 (audit sweep).** See the update note at the top of this document for the full list.
7. ~~Automated test suite + CI pipeline, structured logging (§6)~~ — **done as of 2026-08-18 (Stage 5).** Sentry was added and then removed at the user's request the same day — see the update note at the top of this document.
8. **What's left is genuinely large feature work, not bug fixes**: the conditional/branching (IF/Switch) node type, tool-calling/memory for the AI Agent node, and the standalone execution worker (README roadmap item). Each deserves its own scoping pass. See the "Launch Runway" report for the fuller staged roadmap.
