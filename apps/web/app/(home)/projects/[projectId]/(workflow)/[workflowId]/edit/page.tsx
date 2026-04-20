import WorkflowEditor from "@/components/editor/workflow-editor";

export default async function ProjectWorkflowEditPage({ params }: { params: Promise<{ projectId: string, workflowId: string }> }) {
    const { workflowId, projectId } = await params;
    return (
        <WorkflowEditor
            workflowId={workflowId}
            projectId={projectId}
        />
    )
}