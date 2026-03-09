import z from "zod";

export const UserSchema = z.object({
    id: z.string().cuid(),
    name: z.string().min(1),
    email: z.string().email(),
    createdAt: z.date()
});