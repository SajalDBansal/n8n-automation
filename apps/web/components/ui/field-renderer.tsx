"use client"


import { NodeBaseProperties } from "@workspace/types"
import { Input } from "@workspace/ui/components/input"

interface FieldRendererProps {
    property: NodeBaseProperties
    value: string | number | boolean
    onChange: (value: string | number | boolean) => void
}

export function FieldRenderer({ property, value, onChange }: FieldRendererProps) {
    const currentValue = value || property.default || ""

    switch (property.type) {
        case "STRING":
            return (
                <Input
                    type={property.typeOptions?.password ? "password" : "text"}
                    placeholder={property.placeholder || ""}
                    value={String(currentValue)}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full"
                />
            )
        case "HIDDEN":
            return null
        default:
            return (
                <Input
                    value={String(currentValue)}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full"
                />
            )
    }
}