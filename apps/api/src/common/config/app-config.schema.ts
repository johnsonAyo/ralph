import { z } from "zod";
export const appConfigSchema = z
    .object({
    PORT: z.coerce.number().int().positive().optional(),
    WEB_ORIGIN: z.string().url().optional(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENAI_MODEL: z.string().min(1).optional(),
    OPENAI_EXTRACTION_MODEL: z.string().min(1).optional(),
    OLLAMA_URL: z.string().url().optional(),
    OLLAMA_MODEL: z.string().min(1).optional(),
    // Set for Ollama Cloud (https://ollama.com) — sent as a Bearer auth header.
    // Leave blank for a local Ollama instance.
    OLLAMA_API_KEY: z.string().min(1).optional(),
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    SCRAPE_DO_TOKEN: z.string().min(1).optional(),
    WEB_URL: z.string().url().optional(),
    // Vehicle data sources (Phase 1). All optional so the app boots without them;
    // the lookup endpoint reports "no sources configured" until they're set.
    DVLA_VES_API_KEY: z.string().min(1).optional(),
    DVLA_VES_URL: z.string().url().optional(),
    DVSA_MOT_CLIENT_ID: z.string().min(1).optional(),
    DVSA_MOT_CLIENT_SECRET: z.string().min(1).optional(),
    DVSA_MOT_API_KEY: z.string().min(1).optional(),
    DVSA_MOT_TOKEN_URL: z.string().url().optional(),
    DVSA_MOT_SCOPE: z.string().min(1).optional(),
    DVSA_MOT_URL: z.string().url().optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    SUPABASE_WEBHOOK_SECRET: z.string().min(1).optional(),
})
    .passthrough();
