

interface PropertyOption {
    name: string;
    value: string | number | boolean;
}

interface Property {
    name: string;
    displayName: string;
    type: string;
    required?: boolean;
    default?: string | number | boolean;
    placeholder?: string;
    description?: string;
    rows?: number;
    options?: PropertyOption[];
}

interface PropertyRendererProps {
    property: Property
    value: string | number | boolean
    onChange: (value: string | number | boolean) => void
}

export default function RenderProperty({ property, value, onChange }: PropertyRendererProps) {
    return (
        <div>

        </div>
    )
}