import prisma from "..";


async function seed() {
    const userId = "cmo8782sg0001l8g1db0028s7";

    // 1. Create Project
    const project = await prisma.project.create({
        data: {
            name: "Demo Project",
            description: "Seeded project for workflow testing",
            userId,
            type: "PERSONAL",
            icon: {
                type: "emoji",
                value: "⚡",
            },
        },
    });

    // 2. Create Credential
    const credential = await prisma.credential.create({
        data: {
            name: "Demo API Key",
            type: "apiKey",
            data: {
                apiKey: "demo-secret-key",
            },
            projectId: project.id,
        },
    });

    // 3. Create Workflow
    const workflow = await prisma.workflow.create({
        data: {
            name: "Sample Workflow",
            description: "Trigger → Agent → Email",
            projectId: project.id,
            active: true,
        },
    });

    // 4. Create Nodes
    const triggerNode = await prisma.node.create({
        data: {
            name: "Manual Trigger",
            type: "TRIGGER",
            description: "Starts the workflow",
            parameters: {},
            positionX: 0,
            positionY: 0,
            workflowId: workflow.id,
        },
    });

    const agentNode = await prisma.node.create({
        data: {
            name: "AI Agent",
            type: "AGENT",
            description: "Processes input",
            parameters: {
                prompt: "Summarize input",
            },
            positionX: 300,
            positionY: 0,
            workflowId: workflow.id,
        },
    });

    const actionNode = await prisma.node.create({
        data: {
            name: "Send Email",
            type: "ACTION",
            description: "Send output via email",
            parameters: {
                to: "test@example.com",
            },
            positionX: 600,
            positionY: 0,
            workflowId: workflow.id,
            credentialId: credential.id,
        },
    });

    // 5. Create Edges
    await prisma.edge.createMany({
        data: [
            {
                source: triggerNode.id,
                target: agentNode.id,
                workflowId: workflow.id,
            },
            {
                source: agentNode.id,
                target: actionNode.id,
                workflowId: workflow.id,
            },
        ],
    });

    // 6. Create Execution
    await prisma.execution.create({
        data: {
            workflowId: workflow.id,
            status: "SUCCESS",
            isFinished: true,
            result: {
                message: "Workflow executed successfully",
            },
            startedAt: new Date(),
            stoppedAt: new Date(),
        },
    });

    console.log("✅ Seed completed");
    console.log({
        projectId: project.id,
        workflowId: workflow.id,
    });
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });