import prisma from "@workspace/database";
import { auth } from "@/lib/auth";

// A distinguishable prefix + timestamp keeps test accounts easy to spot and
// collision-free across repeated local runs against a shared dev database.
export const uniqueEmail = (label: string) => `inttest-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

export type TestUser = {
    id: string;
    email: string;
    sessionCookie: string;
};

// Creates a real account through Better Auth's own API (not a raw Prisma
// insert) so password hashing, session creation, and the archived-account
// hook all run for real. Returns the session cookie so callers can act as
// this user against either `auth.api.*` directly or real HTTP routes.
export async function createTestUser(label: string, password = "TestPass123!"): Promise<TestUser> {
    const email = uniqueEmail(label);

    const signUp = await auth.api.signUpEmail({
        body: { email, password, name: `Integration Test ${label}` },
    });

    const signInResponse = await auth.api.signInEmail({
        body: { email, password },
        asResponse: true,
    });

    const setCookie = signInResponse.headers.get("set-cookie");
    if (!setCookie) {
        throw new Error(`Sign-in for test user ${email} did not return a session cookie`);
    }

    return {
        id: signUp.user.id,
        email,
        sessionCookie: setCookie.split(";")[0]!,
    };
}

export async function deleteTestUser(userId: string) {
    // Cascades to sessions/accounts/projects/workflows/etc per the schema's
    // onDelete: Cascade relations.
    await prisma.user.delete({ where: { id: userId } }).catch(() => { });
}

// Minimal Project -> Workflow -> Execution chain via direct Prisma writes.
// Node/Edge graph data for execution tests is passed straight to
// runWorkflowExecution as plain objects (the engine never reads Node/Edge
// tables), so only Workflow/Execution need to exist as real rows to satisfy
// the Execution.workflowId foreign key.
export async function createTestProjectAndWorkflow(userId: string, label: string) {
    const project = await prisma.project.create({
        data: {
            name: `Integration Test Project ${label}`,
            type: "PERSONAL",
            userId,
        },
    });

    const workflow = await prisma.workflow.create({
        data: {
            name: `Integration Test Workflow ${label}`,
            projectId: project.id,
            active: true,
        },
    });

    return { project, workflow };
}

export async function createTestExecution(workflowId: string) {
    const execution = await prisma.execution.create({
        data: {
            workflowId,
            status: "STARTING",
            data: {},
        },
        select: { id: true },
    });
    return execution.id;
}
