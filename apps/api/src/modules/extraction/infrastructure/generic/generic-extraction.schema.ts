import { z } from "zod";

/**
 * What we ask the LLM to return for ANY listing page. Every field is nullable
 * (not optional) so the JSON schema lists all keys as required — the canonical
 * OpenAI strict structured-output shape. The model emits null for anything it
 * cannot support from the page, and we translate null -> undefined downstream.
 */
export const genericExtractionSchema = z.object({
    lotNumber: z.string().nullable(),
    title: z.string().nullable(),
    year: z.number().int().nullable(),
    make: z.string().nullable(),
    model: z.string().nullable(),
    mileage: z.number().int().nullable(),
    mileageUnit: z.string().nullable(),
    currentBid: z.number().nullable(),
    buyItNowPrice: z.number().nullable(),
    currency: z.string().nullable(),
    saleDate: z.string().nullable(),
    location: z.string().nullable(),
    category: z.string().nullable(),
    primaryDamage: z.string().nullable(),
    secondaryDamage: z.string().nullable(),
    runCondition: z.string().nullable(),
    hasKeys: z.boolean().nullable(),
    v5Status: z.string().nullable(),
    estimatedRetailValue: z.number().nullable(),
    /** Vehicle photos chosen from the supplied candidate list, in display order. */
    imageUrls: z.array(z.string()),
});

export type GenericExtraction = z.infer<typeof genericExtractionSchema>;

/** Core fields used to score extraction confidence for any platform. */
export const GENERIC_REQUIRED_FIELDS = [
    "lotNumber",
    "title",
    "year",
    "make",
    "model",
    "mileage",
    "currentBid",
    "location",
    "category",
    "primaryDamage",
    "images",
] as const;
