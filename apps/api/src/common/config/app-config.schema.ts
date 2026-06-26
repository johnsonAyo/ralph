import { z } from "zod";

export const appConfigSchema = z
  .object({
    PORT: z.coerce.number().int().positive().optional(),
    WEB_ORIGIN: z.string().url().optional(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENAI_MODEL: z.string().min(1).optional(),
    OLLAMA_URL: z.string().url().optional(),
    OLLAMA_MODEL: z.string().min(1).optional(),
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    WEB_URL: z.string().url().optional(),
  })
  .passthrough();
