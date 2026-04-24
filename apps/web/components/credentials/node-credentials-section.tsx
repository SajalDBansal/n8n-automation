"use client"

import { CredentialRecord, NodeCredentialsName } from "@workspace/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";


interface CredentialType {
    name: NodeCredentialsName;
    displayName?: string;
    required?: boolean;
}

interface CredentialsSectionProps {
    credentials: CredentialType[]
    availableCredentials: CredentialRecord[]
    credentialId: string
    onCredentialChange: (credentialName: NodeCredentialsName, credentialId: string) => void
    onCreateCredential: (credentialName: NodeCredentialsName) => void
}

interface CredentialSelectorProps {
    credentialType: CredentialType
    availableCredentials: CredentialRecord[]
    credentialId: string
    onCredentialChange: (credentialId: string) => void
    onCreateNew: () => void
}

export default function CredentialsSection({
    credentials,
    availableCredentials,
    credentialId,
    onCredentialChange,
    onCreateCredential
}: CredentialsSectionProps) {
    if (!credentials || credentials.length === 0) {
        return <p className="text-sm text-muted-foreground">No credentials required for this node.</p>
    }

    return (
        <div className="space-y-4">
            {credentials.map((credentialType) => {
                const typeCredentials = availableCredentials.filter(
                    (cred) => cred.type === credentialType.name
                )

                return (
                    <CredentialSelector
                        key={credentialType.name}
                        credentialType={credentialType}
                        availableCredentials={typeCredentials}
                        // availableCredentials={availableCredentials}
                        credentialId={credentialId}
                        onCredentialChange={(credentialId) =>
                            onCredentialChange(credentialType.name, credentialId)
                        }
                        onCreateNew={() => onCreateCredential(credentialType.name)}
                    />
                )
            })}
        </div>
    )
}

function CredentialSelector({
    credentialType,
    availableCredentials,
    credentialId,
    onCredentialChange,
    onCreateNew
}: CredentialSelectorProps) {

    const handleValueChange = (value: string) => {
        if (value === "create-new") {
            onCreateNew();
            return;
        }
        onCredentialChange(value);
    }


    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block">
                Credential to connect with
                {credentialType.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Select value={credentialId} onValueChange={handleValueChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={`${credentialType.displayName || credentialType.name} account`} />
                </SelectTrigger>
                <SelectContent className="w-full" position="popper" align="end">
                    {availableCredentials.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id} className="p-3">
                            <div className="flex items-center gap-3 w-full">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{credential.name}</div>
                                    {/* <div className="text-xs text-gray-500">{credentialType.displayName || credentialType.name}</div> */}
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                    <div className="border-t my-1"></div>
                    <SelectItem value="create-new" className="p-3">
                        <div className="flex items-center gap-3 text-blue-600">
                            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                <span className="text-blue-600 text-sm">+</span>
                            </div>
                            <span className="font-medium">Create new credential</span>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
            {availableCredentials.length === 0 && (
                <p className="text-sm text-gray-500">
                    No {credentialType.displayName || credentialType.name} credentials configured.
                    <button
                        className="text-blue-500 hover:underline ml-2"
                        onClick={onCreateNew}
                    >
                        Create one now
                    </button>
                </p>
            )}
        </div>
    )
}