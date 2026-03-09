import * as z from "zod";
import { registerZodSchema, resendOTPZodSchema, resetPasswordZodSchema, signinZodSchema, verifyOTPZodSchema } from "@workspace/validators";

export type RegisterFormValues = z.infer<typeof registerZodSchema>;

export type SigninFormValues = z.infer<typeof signinZodSchema>;

export type VerifyOtpFormValues = z.infer<typeof verifyOTPZodSchema>

export type SendOtpFormValues = z.infer<typeof resendOTPZodSchema>

export type ResetPasswordFormValues = z.infer<typeof resetPasswordZodSchema>

