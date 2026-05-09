import { NodeBaseProperties } from "@workspace/types";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Info } from "lucide-react";

type NodePropertyRendererProps = {
    property: NodeBaseProperties;
    value: string | number | boolean;
    onChange: (value: string | number | boolean) => void;
}

const handleDragOver = (ev: React.DragEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    ev.preventDefault();
    ev.currentTarget.classList.add("ring-2", "ring-blue-500");
}

const handleDragLeave = (ev: React.DragEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    ev.currentTarget.classList.remove("ring-2", "ring-blue-500");
}

const createDropHandler = (
    currentValue: string | number | boolean,
    onChange: (value: string | number | boolean) => void
) => {
    return (ev: React.DragEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        ev.preventDefault();
        ev.currentTarget.classList.remove("ring-2", "ring-blue-500");
        const droppedData = ev.dataTransfer.getData("text");
        // console.log("Dropped Expression: ", droppedData);
        const currentVal = currentValue.toString();
        const newVal = currentVal ? `${currentVal} ${droppedData}` : droppedData;
        onChange(newVal);
    }
}



export function PropertyRenderer({ property, value, onChange, }: NodePropertyRendererProps) {

    if (!property) return null;

    const currentValue = value || property.default || '';

    const dragProps = {
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: createDropHandler(currentValue, onChange),
    };

    switch (property.type) {
        case "NOTICE":
            return (
                <div
                    className="p-4 bg-orange-50 border border-orange-200 rounded-lg mt-2"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <Info className="w-3 h-3 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <div
                                className="text-sm text-gray-700 leading-relaxed"
                            >
                                {property.description}
                            </div>
                        </div>
                    </div>
                </div>
            )

        case "STRING":
            return (
                <Input
                    placeholder={property.placeholder || ''}
                    value={currentValue.toString()}
                    {...dragProps}
                    onChange={(e) => onChange(e.target.value)}
                    className=" transition-all"
                />
            )

        case "OPTIONS":
            return (
                <Select
                    value={currentValue.toString()}
                    onValueChange={(value) => onChange(value)}
                >
                    <SelectTrigger className="mt-2">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent >
                        {property.options?.map((option) => (
                            <SelectItem key={option.value.toString()} value={option.value.toString()}>
                                {option.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )

        default:
            return (
                <Input
                    placeholder={property.placeholder || ''}
                    value={currentValue.toString()}
                    onChange={(e) => onChange(e.target.value)}
                    className="mt-2"
                />
            )
    }
}