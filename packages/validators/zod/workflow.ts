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