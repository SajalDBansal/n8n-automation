import z from "zod";

export const registerZodSchema = z.object({
    userName: z.string({
        required_error: "Username is required",
        invalid_type_error: "UserName needs to be a proper string"
    }).trim().min(3, "Username must be at least 3 characters"),
    email: z.string().trim().email("Invalid email format"),
    password: z.string().min(8)
        .regex(/[A-Z]/, "Must include uppercase letter")
        .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string().min(8)
}).refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

export const signinZodSchema = z.object({
    email: z.string().trim().email("Invalid email format"),
    password: z.string().min(8)
        .regex(/[A-Z]/, "Must include uppercase letter")
        .regex(/[0-9]/, "Must include a number"),
})

export const verifyOTPZodSchema = z.object({
    token: z.string({ message: "Must be a proper token" }).trim(),
    otp: z.string({
        invalid_type_error: "Must be a proper string",
        required_error: "OTP is required"
    }).trim().length(6, "OTP must be 6 characters")
})

export const resendOTPZodSchema = z.object({
    email: z.string().trim().email("Invalid email format"),
})

export const forgetPasswordZodSchema = z.object({
    email: z.string().trim().email("Invalid email format"),
})

export const resetPasswordZodSchema = z.object({
    token: z.string({
        required_error: "Token is required",
        invalid_type_error: "Must be a proper token"
    }),
    password: z.string().min(8)
        .regex(/[A-Z]/, "Must include uppercase letter")
        .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string().min(8)
}).refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

export const changePasswordZodSchema = z.object({
    email: z.string().trim().email("Invalid email format"),
    newPassword: z.string().min(8)
        .regex(/[A-Z]/, "Must include uppercase letter")
        .regex(/[0-9]/, "Must include a number"),
    password: z.string().min(8)
        .regex(/[A-Z]/, "Must include uppercase letter")
        .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string().min(8)
}).refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

export const archiveUserZodSchema = z.object({
    email: z.string().trim().email("Invalid email format"),
    password: z.string().min(8)
        .regex(/[A-Z]/, "Must include uppercase letter")
        .regex(/[0-9]/, "Must include a number"),
})