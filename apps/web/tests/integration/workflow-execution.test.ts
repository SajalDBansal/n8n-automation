import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import prisma from "@workspace/database";
import { runWorkflowExecution } from "@workspace/execution-core";
import type { Node, Edge, ExecutionStatusType } from "@workspace/types";
import { createTestUser, createTestProjectAndWorkflow, createTestExecution, deleteTestUser } from "./helpers";

// runWorkflowExecution is a pure function with zero Next.js dependency (no
// next/headers anywhere in packages/execution-core), so — unlike the IDOR
// suite — this needs no running server. It does write real Execution-status
// rows through Prisma, so it needs a live Postgres and a real Workflow row
// to satisfy Execution.workflowId's foreign key.

type FakeEvent = { status: ExecutionStatusType; nodeData?: { nodeId: string; nodeName: string; nodeStatus: string } };

function fakePublisher() {
    const events: FakeEvent[] = [];
    return {
        events,
        publish: async (payload: Record<string, unknown>) => {
            events.push(payload as FakeEvent);
        },
    };
}

describe("workflow execution", () => {
    let userId: string;
    let workflowId: string;

    beforeAll(async () => {
        const user = await createTestUser("exec");
        userId = user.id;
        const { workflow } = await createTestProjectAndWorkflow(userId, "exec");
        workflowId = workflow.id;
    });

    afterAll(async () => {
        await deleteTestUser(userId);
    });

    it("a diamond graph with one failing branch still runs the merge node, and reports ERROR overall", async () => {
        // T -> B, T -> C, B -> D, C -> D. B is a Telegram node missing the
        // chatId/text it requires, which trips the engine's own VALIDATION
        // check before any real credential lookup or network call — a
        // controlled, deterministic failure with no external dependency.
        const nodes: Node[] = [
            { id: "t", name: "manualTrigger", type: "TRIGGER", position: { x: 0, y: 0 }, parameters: {}, data: {} },
            { id: "b", name: "telegram", type: "ACTION", position: { x: 0, y: 0 }, parameters: {}, data: {} },
            { id: "c", name: "manualTrigger", type: "ACTION", position: { x: 0, y: 0 }, parameters: {}, data: {} },
            { id: "d", name: "manualTrigger", type: "ACTION", position: { x: 0, y: 0 }, parameters: {}, data: {} },
        ];
        const edges: Edge[] = [
            { id: "e1", source: "t", target: "b" },
            { id: "e2", source: "t", target: "c" },
            { id: "e3", source: "b", target: "d" },
            { id: "e4", source: "c", target: "d" },
        ];

        const executionId = await createTestExecution(workflowId);
        const publisher = fakePublisher();

        await runWorkflowExecution(
            { workflowId, executionId, projectId: "test-project", nodes, edges },
            publisher
        );

        const dStatuses = publisher.events
            .filter((e) => e.nodeData?.nodeId === "d")
            .map((e) => e.nodeData!.nodeStatus);

        const finalEvent = publisher.events[publisher.events.length - 1];
        expect(finalEvent?.status).toBe("ERROR");

        const row = await prisma.execution.findUnique({ where: { id: executionId } });
        expect(row?.status).toBe("ERROR");
        expect(row?.isFinished).toBe(true);

        // Regression guard for the diamond/merge bug: node "d" (the merge
        // point) must have actually run and succeeded via its live sibling
        // branch "c", not been cascade-blocked just because "b" failed.
        expect(dStatuses).toContain("SUCCESS");
    });

    it("an isolated trigger node with no edges is a valid single-node workflow", async () => {
        const nodes: Node[] = [
            { id: "solo", name: "manualTrigger", type: "TRIGGER", position: { x: 0, y: 0 }, parameters: { hello: "world" }, data: {} },
        ];

        const executionId = await createTestExecution(workflowId);
        const publisher = fakePublisher();

        await runWorkflowExecution(
            { workflowId, executionId, projectId: "test-project", nodes, edges: [] },
            publisher
        );

        const finalEvent = publisher.events[publisher.events.length - 1];
        expect(finalEvent?.status).toBe("FINISHED");

        const row = await prisma.execution.findUnique({ where: { id: executionId } });
        expect(row?.status).toBe("SUCCESS");
    });
});
