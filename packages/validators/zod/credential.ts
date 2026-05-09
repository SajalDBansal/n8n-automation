import z from "zod";

// Keep this in sync by hand with `NodeCredentialsName` in
// packages/types/types/node.ts (validators can't depend on @workspace/types
// for this — types already depends on validators for its zod-inferred form
// types, and adding the reverse edge creates a circular package dependency).
const CREDENTIAL_TYPES = ["telegramApi", "resendApi", "googleGeminiApi"] as const;

export const createCredentialZodSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name needs to be a proper string"
    }).trim().min(3, "name must be at least 3 characters"),
    type: z.enum(CREDENTIAL_TYPES, {
        message: "Type must be one of the supported credential types",
    }),
    projectId: z.string({
        required_error: "Project ID is required",
        invalid_type_error: "Project ID needs to be a proper string"
    }),
    data: z.record(z.string(), z.any()),
});

export const updateCredentialZodSchema = z.object({
    name: z.string().trim().min(3, "name must be at least 3 characters").optional(),
    // Partial — only fields the user actually typed a new value into are
    // sent, so a blank field on edit means "keep the existing value" rather
    // than "overwrite with empty".
    data: z.record(z.string(), z.any()).optional(),
});