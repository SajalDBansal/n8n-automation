import z from "zod";

export const createCredentialZodSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name needs to be a proper string"
    }).trim().min(3, "name must be at least 3 characters"),
    type: z.string({
        required_error: "Type is required",
        invalid_type_error: "Type needs to be a proper string"
    }),
    projectId: z.string({
        required_error: "Project ID is required",
        invalid_type_error: "Project ID needs to be a proper string"
    }),
    data: z.record(z.string(), z.any()),
});