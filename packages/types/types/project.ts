import { z } from "zod";
import { createProjectFormZodSchema } from "@workspace/validators";

export type CreateProjectFormValues = z.infer<typeof createProjectFormZodSchema>;