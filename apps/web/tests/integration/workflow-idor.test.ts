import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import prisma from "@workspace/database";
import { createTestUser, createTestProjectAndWorkflow, deleteTestUser } from "./helpers";

// Unlike the auth/execution suites, this one genuinely needs a running
// server: the ownership check being regression-tested lives inside the
// Next.js route handler itself (apps/web/app/api/projects/[projectId]/
// workflow/[workflowId]/route.ts), which — like every authenticated route in
// this app — calls headers() from next/headers, and that only works inside
// a real request handled by Next's own server. There's no way to exercise
// that code path by importing the handler function directly.
//
// Requires `bun run dev` (or an equivalent server) already running at
// BASE_URL before this file executes — see apps/web/tests/integration/README
// and the CI workflow for how that's arranged.
const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

describe("workflow ownership (IDOR regression)", () => {
    let userAId: string;
    let userBId: string;
    let userACookie: string;
    let userBCookie: string;
    let workflowId: string;
    let projectId: string;

    beforeAll(async () => {
        const userA = await createTestUser("idor-a");
        const userB = await createTestUser("idor-b");
        userAId = userA.id;
        userBId = userB.id;
        userACookie = userA.sessionCookie;
        userBCookie = userB.sessionCookie;

        const { project, workflow } = await createTestProjectAndWorkflow(userAId, "idor");
        projectId = project.id;
        workflowId = workflow.id;
    });

    afterAll(async () => {
        await deleteTestUser(userAId);
        await deleteTestUser(userBId);
    });

    it("a second account cannot GET another user's workflow", async () => {
        const res = await fetch(`${BASE_URL}/api/projects/${projectId}/workflow/${workflowId}`, {
            headers: { cookie: userBCookie },
        });
        expect(res.status).toBe(404);
    });

    it("a second account cannot DELETE another user's workflow, and the row survives", async () => {
        const res = await fetch(`${BASE_URL}/api/projects/${projectId}/workflow/${workflowId}`, {
            method: "DELETE",
            headers: { cookie: userBCookie },
        });
        expect(res.status).toBe(404);

        const row = await prisma.workflow.findUnique({ where: { id: workflowId } });
        expect(row).not.toBeNull();
    });

    it("a second account cannot PATCH another user's workflow, and the row is unchanged", async () => {
        const originalName = (await prisma.workflow.findUnique({ where: { id: workflowId } }))!.name;

        const res = await fetch(`${BASE_URL}/api/projects/${projectId}/workflow/${workflowId}`, {
            method: "PATCH",
            headers: { cookie: userBCookie, "content-type": "application/json" },
            body: JSON.stringify({ id: workflowId, name: "Hijacked Name", description: "hijacked" }),
        });
        expect(res.status).toBe(404);

        const row = await prisma.workflow.findUnique({ where: { id: workflowId } });
        expect(row?.name).toBe(originalName);
    });

    it("the owning account can still GET its own workflow", async () => {
        // Confirms the ownership fix didn't over-correct into blocking
        // legitimate access too.
        const res = await fetch(`${BASE_URL}/api/projects/${projectId}/workflow/${workflowId}`, {
            headers: { cookie: userACookie },
        });
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.data.id).toBe(workflowId);
    });
});
