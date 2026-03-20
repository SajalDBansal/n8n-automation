import z from "zod";

export const createProjectFormZodSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name needs to be a proper string"
    }).trim().min(3, "name must be at least 3 characters"),
    description: z.string({ invalid_type_error: "Name needs to be a proper string" }).optional(),
    type: z.enum(["PERSONAL", "TEAM"])
});

export const createProjectZodSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name needs to be a proper string"
    }).trim().min(3, "name must be at least 3 characters"),
    description: z.string({ invalid_type_error: "Name needs to be a proper string" }).optional(),
    type: z.enum(["PERSONAL", "TEAM"]),
    icon: z.object({
        type: z.enum(["ICON", "IMAGE"]),
        value: z.string()
    }),
    userId: z.string({
        required_error: "userId is required",
        invalid_type_error: "userId needs to be a proper string"
    }).optional()
});


export const updateProjectZodSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name needs to be a proper string"
    }).trim().min(3, "name must be at least 3 characters").optional(),
    description: z.string({ invalid_type_error: "Name needs to be a proper string" }).optional(),
    type: z.enum(["PERSONAL", "TEAM"]).optional(),
    icon: z.object({
        type: z.enum(["ICON", "IMAGE"]),
        value: z.string()
    }).optional()
});