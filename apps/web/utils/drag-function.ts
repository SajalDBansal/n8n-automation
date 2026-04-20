import { NodeName } from "@workspace/types"

export const onDragStart = (
    event: any,
    nodeName: NodeName
) => {
    event.dataTransfer.setData('application/reactflow', nodeName)
    event.dataTransfer.effectAllowed = 'move'
}