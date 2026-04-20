export type NodeType = "TRIGGER" | "AGENT" | "WEBHOOK" | "ACTION" | "CHAT_MODEL";

export type NodeName = "webhook" | "telegram" | "resend" | "manualTrigger" | "lmChatGoogleGemini" | "agent";


export interface SupplyData {
    success: boolean;
    model?: any;
    data?: any
    error?: string;
}

export type NodeBaseType = { type: NodeExecutionType & NodeMetaData; }

export interface NodeExecutionType {
    supplyData?(params: {
        parameters: any;
        credentialId: string;
        projectId: string
    }): Promise<SupplyData>;
    execute?(params: {
        parameters?: any;
        credentialId?: string;
        projectId?: string;
        model?: any;
    }): Promise<SupplyData>;
}

export interface NodeMetaData {
    nodeType: NodeType
    description: NodeBaseDescription;
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
    name: NodeName;
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