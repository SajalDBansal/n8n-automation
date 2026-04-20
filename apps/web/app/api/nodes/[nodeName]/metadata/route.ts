import { NextResponse } from "next/server";
import { PredefinedNodeMetaData } from "@workspace/node-base";
import type { NodeName } from "@workspace/types";

export async function GET(_request: Request, { params }: { params: Promise<{ nodeName: NodeName }> }) {
    const { nodeName } = await params;

    const data = PredefinedNodeMetaData[nodeName];

    if (!data) {
        return NextResponse.json(
            { success: false, message: "Unknown node type" },
            { status: 404 }
        );
    }

    return NextResponse.json(
        {
            success: true,
            message: "Node metadata fetched successfully",
            data: {
                displayName: data.description.displayName,
                type: data.nodeType,
                name: data.description.name,
                description: data.description.description,
                icon: data.description.icon,
                group: data.description.group,
                properties: data.description.properties,
                credentials: data.description.credentials,
                defaults: data.description.defaults,
            },
        },
        { status: 200 }
    );
}

