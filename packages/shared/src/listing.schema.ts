import { z } from "zod";

export enum AuctionPlatformCode {
  CopartUk = "copart_uk",
  IaaSynetiqUk = "iaa_synetiq_uk",
  Other = "other",
}

export enum ExtractionConfidence {
  High = "high",
  Medium = "medium",
  Low = "low",
}

export const auctionPlatformSchema = z.enum(AuctionPlatformCode);

export const extractedImageSchema = z.object({
  sequence: z.number().int().positive().optional(),
  label: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  fullUrl: z.string().url(),
  highResUrl: z.string().url().optional(),
});

export const listingSnapshotSchema = z.object({
  platform: auctionPlatformSchema,
  listingUrl: z.string().url(),
  lotNumber: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  year: z.number().int().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  mileage: z.number().int().nonnegative().optional(),
  mileageUnit: z.string().optional(),
  currentBid: z.number().nonnegative().optional(),
  buyItNowPrice: z.number().nonnegative().optional(),
  currency: z.string().default("GBP"),
  saleDate: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  primaryDamage: z.string().optional(),
  secondaryDamage: z.string().optional(),
  runCondition: z.string().optional(),
  hasKeys: z.boolean().optional(),
  v5Status: z.string().optional(),
  estimatedRetailValue: z.number().nonnegative().optional(),
  images: z.array(extractedImageSchema).default([]),
  extractionConfidence: z.enum(ExtractionConfidence).default(ExtractionConfidence.Low),
  missingFields: z.array(z.string()).default([]),
});

export type AuctionPlatform = z.infer<typeof auctionPlatformSchema>;
export type ExtractedImage = z.infer<typeof extractedImageSchema>;
export type ListingSnapshot = z.infer<typeof listingSnapshotSchema>;
