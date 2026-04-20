import { INodeIcon } from "@/components/ui/node-icon";
import { PredefinedNodeMetaData } from "@workspace/node-base";
import { NodeIconType, NodeMetaData, NodeName } from "@workspace/types";

export function getNodeMetadata(nodeName: NodeName) {
    const nodeDefinition: NodeMetaData = PredefinedNodeMetaData[nodeName];

    const data = nodeDefinition.description;

    return {
        displayName: data.displayName,
        type: data.nodeType,
        name: data.name,
        description: data.description,
        icon: getNodeIcon(nodeName),
        group: data.group,
        properties: data.properties,
        credentials: data.credentials,
        defaults: data.defaults,
    };
}

export function getNodeIcon(nodeType: NodeName): string | INodeIcon {
    // Try with the original nodeType first
    let nodeDefinition = PredefinedNodeMetaData[nodeType];

    if (!nodeDefinition.description.icon) {
        return { type: 'lucide', value: 'Settings', color: 'gray' };
    }

    const icon = nodeDefinition.description.icon;


    // If icon is already in new format, return it
    if (typeof icon === 'object') {
        return icon as INodeIcon;
    }

    // Handle legacy string format
    if (typeof icon === 'string') {
        return icon;
    }

    // Fallback
    return { type: 'lucide', value: 'Settings', color: 'gray' };
}

export function getNodeDisplayName(nodeName: NodeName) {
    return PredefinedNodeMetaData[nodeName].description.displayName;
}