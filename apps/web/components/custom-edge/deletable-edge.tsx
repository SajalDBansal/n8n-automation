"use client";

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { X } from 'lucide-react';

export function DeletableEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeClick = () => {
        const edgeData = data as { onDelete?: (id: string) => void };
        if (edgeData?.onDelete) {
            edgeData.onDelete(id);
        }
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <button
                        className="w-3 h-3 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 border border-white cursor-pointer"
                        onClick={onEdgeClick}
                        title="Delete connection"
                    >
                        <X className="w-3/3  h-3/3 " />
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
