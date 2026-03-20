export type NodeType = "TRIGGER" | "AGENT" | "WEBHOOK" | "ACTION" | "CHAT_MODEL";

export interface SupplyData {
    success: boolean;
    model?: any;
    error?: string;
}

export interface NodeBaseType {
    nodeType: NodeType
    description: NodeBaseDescription;
    supplyData?(params: {
        parameters: any;
        credentialId: string;
    }): Promise<SupplyData>;
}

type NodeGroupType = "INPUT" | "OUTPUT" | "TRIGGER" | "TRANSFORM" | "MODEL";

export interface NodeIconType {
    type: "font-awesome" | "lucide" | "file" | "url" | "svg";
    value: string;
    color?: string
}

export interface NodeCredentialDescription {
    name: string;
    required?: boolean;
    displayName?: string;
}

export interface NodeBaseDescription {
    displayName: string;
    name: string;
    description: string;
    version: number;
    icon?: NodeIconType;
    iconColor?: string;
    group: NodeGroupType[];
    nodeType: NodeType;
    defaults: NodeBaseDefualtType;
    eventTriggerDescription?: string;
    activationMessage?: string;
    inputNames?: string[];
    outputNames?: string[];
    maxNodes?: number;
    polling?: boolean;
    supportsCORS?: boolean;
    properties: NodeBaseProperties[];
    credentials?: NodeCredentialDescription[];
}

export type NodeBaseDefualtType = {
    color?: string;
    name?: string;
}

export type NodePropertyTypes = "NOTICE" | "OPTIONS" | "STRING" | "HIDDEN";

export interface NodeBaseProperties {
    displayName: string;
    name: string;
    type: NodePropertyTypes;
    typeOptions?: { password?: true };
    default: any;
    description?: string;
    options?: any;
    placeholder?: string;
    noDataExpression?: boolean;
    required?: boolean;
}

export interface NodeCredentialsType {
    name: string;
    displayName: string;
    documentationUrl?: string;
    properties: NodeBaseProperties[]

}