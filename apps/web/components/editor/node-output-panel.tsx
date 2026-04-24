import { Separator } from "@workspace/ui/components/separator";
import { TriangleAlert } from "lucide-react";

export default function NodeOutputPanel({ output }: { output: { json?: Record<string, unknown> } | null }) {
    const json = output?.json || null;

    return (
        <div className="h-full flex flex-col border rounded-lg">
            <div className="flex items-center justify-between">
                <div className="p-2 text-xl font-semibold shrink-0">
                    Node Output
                </div>
            </div>

            <Separator />

            <div className="flex-1 overflow-y-auto p-3 bg-gray-50 h-full">
                {json && Object.keys(json).length > 0 ? (
                    Object.keys(json).map((key) => (
                        <div key={key} className="mb-3">
                            {renderKeyValue(key, json[key])}
                        </div>
                    ))
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full gap-3">
                        <TriangleAlert size={30} />
                        <h4 className="font-medium text-lg">No Output Data</h4>
                        <p className="text-sm max-w-sm text-muted-foreground">
                            This node doesn't have any output data
                        </p>

                    </div>
                )}
            </div>


        </div>
    )
}


const renderKeyValue = (key: string, value: unknown) => {
    if (typeof value === "object" && value !== null) {
        return (
            <div
                key={key}
                className="mb-3 flex flex-col gap-2 "
            >
                <span className="text-sm  text-gray-700 px-3 py-1 bg-gray-200 rounded-md inline-block w-fit">
                    {key}
                </span>
                <div className="ml-4 flex flex-col gap-2">
                    {Object.keys(value).map((subKey) =>
                        renderKeyValue(subKey, (value as Record<string, unknown>)[subKey])
                    )}
                </div>
            </div>
        );
    } else {
        return (
            <div
                key={key}
                className="flex gap-2 mb-2 "
            >
                <span className="text-sm  text-gray-700 px-3 py-1 bg-gray-200 rounded-md inline-block w-fit">
                    {key}
                </span>
                <span className="text-sm text-gray-600 break-all">{String(value)}</span>
            </div>
        );
    }
};