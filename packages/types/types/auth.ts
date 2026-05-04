import * as z from "zod";
import { registerZodSchema, resetPasswordZodSchema, signinZodSchema, forgetPasswordZodSchema, changePasswordZodSchema, archiveUserZodSchema } from "@workspace/validators";

export type RegisterFormValues = z.infer<typeof registerZodSchema>;

export type SigninFormValues = z.infer<typeof signinZodSchema>;

export type ForgotPasswordFormValues = z.infer<typeof forgetPasswordZodSchema>

export type ResetPasswordFormValues = z.infer<typeof resetPasswordZodSchema>

export type ChangePasswordFormValues = z.infer<typeof changePasswordZodSchema>

export type ArchiveUserFormValues = z.infer<typeof archiveUserZodSchema>
