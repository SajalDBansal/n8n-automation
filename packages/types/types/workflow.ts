import { z } from "zod";
import { createWorkflowFormZodSchema } from "@workspace/validators";

export type CreateWorkflowFormValues = z.infer<typeof createWorkflowFormZodSchema>;