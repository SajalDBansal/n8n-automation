import z from "zod";

export const createWorkflowFormZodSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name needs to be a proper string"
    }).trim().min(3, "name must be at least 3 characters"),
    description: z.string({ invalid_type_error: "Name needs to be a proper string" }).optional(),
});

export const createWorkflowZodSchema = z.object({
    id: z.string({
        required_error: "ID is required",
        invalid_type_error: "ID needs to be a proper string"
    }),
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name needs to be a proper string"
    }).trim().min(3, "name must be at least 3 characters"),
    description: z.string({ invalid_type_error: "Name needs to be a proper string" }).optional(),
});

export const updateWorkflowZodSchema = z.object({
    id: z.string({
        required_error: "ID is required",
        invalid_type_error: "ID needs to be a proper string"
    }),
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name needs to be a proper string"
    }).trim().min(3, "name must be at least 3 characters"),
    description: z.string({ invalid_type_error: "Name needs to be a proper string" }),
});

export const baseNodeSchema = z.object({
    parameters: z.record(z.any(), z.any()).optional(),
    type: z.string(),
    positionX: z.number(),
    positionY: z.number(),
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    data: z.record(z.any(), z.any()).optional(),
});

export const updateWorkflowDataZodSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name needs to be a proper string"
    }).trim().min(3, "name must be at least 3 characters"),
    active: z.boolean(),
    nodes: z.array(baseNodeSchema),
    edges: z.array(
        z.object({
            id: z.string(),
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullable().optional(),
            targetHandle: z.string().nullable().optional(),
        })
    ),
    projectId: z.string({
        required_error: "Project ID is required",
        invalid_type_error: "Project ID needs to be a proper string"
    }),
});