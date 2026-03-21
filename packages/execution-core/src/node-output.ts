import { NodeOutputDataType, NodeOutput as NodeOutputType } from "@workspace/types";

export class NodeOutput {
    json: NodeOutputType;

    constructor() {
        this.json = {};
    }

    addOutput(
        { nodeId, nodeName, json }:
            { nodeId: string, nodeName: string, json: any }
    ) {
        this.json[nodeId] = { nodeName, json };
    }

    getOutputForResolver(): NodeOutputDataType {
        const outputs: NodeOutputDataType = {};

        for (const [nodeId, data] of Object.entries(this.json)) {
            outputs[nodeId] = {
                json: data.json as Record<string, unknown>
            }
        }

        return outputs;

    }
}