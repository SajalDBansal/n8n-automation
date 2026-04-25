
import { getNodeIcon, getNodeMetadata } from "@/lib/node-registery";
import { NodeStatus, type Node, type NodeName, type WorkflowNodeProps } from "@workspace/types";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { Handle, Position } from "@xyflow/react";
import { INodeIcon, NodeIcon } from "../ui/node-icon";
import { NodeExecutionIndicator } from "../ui/node-spinner";
import { NodeDeleteButton } from "../ui/node-delete-button";


export function ModelNode({ id, type, data }: Node) {

    const executionStatus: NodeStatus = data.executionStatus || NodeStatus.idle;

    const getTriggerNodeIcon = (): string | INodeIcon => {
        if (data.engine.name) {
            const registryIcon = getNodeIcon(data.engine.name as NodeName);
            if (registryIcon) return registryIcon;
        }
        switch (data.engine.name) {
            case 'manualTrigger':
                return { type: 'file' as const, value: 'manualTrigger.svg' };
            case 'webhook':
                return { type: 'file' as const, value: 'webhook.svg' };
            default:
                return { type: 'lucide' as const, value: 'Zap', color: 'yellow' };
        }
    };

    return (
        <>
            <div className="flex justify-between items-center w-full">
                <div
                    className={cn(' h-2 w-2 rounded-full border-2 border-card shadow-sm transition-colors duration-300', {
                        'bg-green-500': executionStatus === NodeStatus.success,
                        'bg-blue-500 animate-pulse': executionStatus === NodeStatus.executing,
                        'bg-red-500': executionStatus === NodeStatus.failed,
                        'bg-muted-foreground/30': executionStatus === NodeStatus.idle,
                    })}
                />

                <Badge variant="secondary" className="mb-2 h-5 text-[10px] px-2 font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                    {type}
                </Badge>
            </div>

            <div className="group relative min-w-[260px] w-full max-w-[400px] rounded-lg bg-card border border-border/60 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 overflow-visible">
                {/* Soft gradient background */}
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                <Handle
                    type="target"
                    position={Position.Left}
                    className="w-3 h-3 bg-primary! border-2 border-background! transition-transform group-hover:scale-125"
                />

                <div className="relative gap-4">

                    <div className="flex px-2 justify-between w-full gap-3">
                        {/* image */}
                        <div className="flex items-center justify-center text-primary shrink-0">
                            <NodeIcon
                                icon={getTriggerNodeIcon()}
                                size="md"
                                className="text-primary"
                            />
                        </div>

                        {/* meta Data */}
                        {/* Content */}
                        <div className="flex">
                            <div className="flex flex-col flex-1 min-w-0 py-0.5">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-semibold text-sm text-foreground truncate tracking-tight">
                                        {data.label}
                                    </span>

                                </div>
                                <div className="flex items-center mt-auto">
                                    <span className="text-[10px] font-mono text-muted-foreground/70 bg-muted/40 border border-border/40 px-1.5 py-0.5 rounded-md">
                                        ID: {id}
                                    </span>
                                </div>

                                <p className="text-xs text-muted-foreground truncate mb-2">
                                    {data.engine.description}
                                </p>


                            </div>

                            <NodeExecutionIndicator status={executionStatus} />

                        </div>
                    </div>
                </div>
                <NodeDeleteButton nodeId={id} onDelete={data.onDelete} />

            </div>
        </>
    )
}