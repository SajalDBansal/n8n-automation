"use client";

import { availableCredentials } from "@/lib/credential-registry";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { NodeIcon } from "../ui/node-icon";

type CredentialTypePickerProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: { id: string; displayName: string; properties: typeof availableCredentials[number]["properties"] }) => void;
};

export function CredentialTypePicker({ isOpen, onClose, onSelect }: CredentialTypePickerProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add a credential</DialogTitle>
                    <DialogDescription>Choose which service this credential connects to.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {availableCredentials.map((credentialType) => (
                        <button
                            key={credentialType.name}
                            type="button"
                            onClick={() => onSelect({
                                id: credentialType.name,
                                displayName: credentialType.displayName,
                                properties: credentialType.properties,
                            })}
                            className="flex items-center gap-3 p-3 border border-border/50 rounded-xl bg-background/50 hover:border-primary/40 hover:bg-primary/5 transition-colors text-left cursor-pointer"
                        >
                            <div className="flex items-center justify-center text-primary shrink-0">
                                <NodeIcon icon={{ type: "lucide", value: "KeySquare" }} size="md" className="text-primary" />
                            </div>
                            <span className="font-medium text-sm truncate">{credentialType.displayName}</span>
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
