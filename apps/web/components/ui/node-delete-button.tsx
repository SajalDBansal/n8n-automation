"use client";

import { Trash2 } from 'lucide-react';

interface NodeDeleteButtonProps {
    nodeId: string;
    onDelete?: (nodeId: string) => void;
    className?: string;
}

export function NodeDeleteButton({ nodeId, onDelete, className = "" }: NodeDeleteButtonProps) {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(nodeId);
        }
    };

    return (
        <button
            onClick={handleDelete}
            className={`absolute -top-2 -left-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 opacity-0 group-hover:opacity-100 nodrag z-10 cursor-pointer mt-1  ${className}`}
            title="Delete node"
        >
            <Trash2 className="w-3/5 h-3/5" />
        </button>
    );
}
