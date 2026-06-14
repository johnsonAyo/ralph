import { z } from "zod";

export const extractPreviewRequestSchema = z.object({
  listingUrl: z.string().url(),
});

export type ExtractPreviewRequest = z.infer<typeof extractPreviewRequestSchema>;
