import z from "zod";

const passwordZodSchema = z.string().min(8)
    .regex(/[A-Z]/, "Must include uppercase letter")
    .regex(/[0-9]/, "Must include a number");

export const registerZodSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name needs to be a proper string"
    }).trim().min(3, "Name must be at least 3 characters"),
    email: z.string().trim().email("Invalid email format"),
    password: passwordZodSchema,
    confirmPassword: z.string().min(8)
}).refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

export const signinZodSchema = z.object({
    email: z.string().trim().email("Invalid email format"),
    password: z.string()
})

export const forgetPasswordZodSchema = z.object({
    email: z.string().trim().email("Invalid email format"),
})

export const resetPasswordZodSchema = z.object({
    token: z.string({
        required_error: "Token is required",
        invalid_type_error: "Must be a proper token"
    }),
    newPassword: passwordZodSchema,
    confirmPassword: z.string().min(8)
}).refine(({ newPassword, confirmPassword }) => newPassword === confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

export const changePasswordZodSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: passwordZodSchema,
    confirmPassword: z.string().min(8)
}).refine(({ newPassword, confirmPassword }) => newPassword === confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

export const archiveUserZodSchema = z.object({
    password: z.string().min(8),
})
