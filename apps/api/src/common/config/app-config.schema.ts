import { z } from "zod";

export const appConfigSchema = z
  .object({
    PORT: z.coerce.number().int().positive().optional(),
    WEB_ORIGIN: z.string().url().optional(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1).optional(),
  })
  .passthrough();
