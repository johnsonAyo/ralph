import { z } from "zod";
import { ExtractionConfidence, listingSnapshotSchema, extractedImageSchema } from "./listing.schema";
import { vehicleProfileSchema } from "./vehicle.schema";

// UNIFIED analysis: ANY combination of inputs (registration, a listing URL,
// and/or manual details) -> ONE adaptive AI report, judged against the buyer's
// budget. There is no separate "reg check" vs "auction" pipeline — the inputs
// present decide how rich the report is. This is Ralph's advisory output, NOT a
// data dump: every finding leads with what it MEANS for the buyer, evidence
// underneath. (File name kept for now; this is the single analysis contract.)

export enum VehicleVerdictCode {
  SoundBuy = "sound_buy",
  ConsiderWithCaution = "consider_with_caution",
  BudgetStretch = "budget_stretch",
  InsufficientData = "insufficient_data",
}

export enum BudgetFitCode {
  Comfortable = "comfortable",
  Tight = "tight",
  Over = "over",
  Unknown = "unknown",
}

export enum FindingTone {
  Good = "good",
  Watch = "watch",
}

// Which inputs fed the report — used to label it and decide which sections have data.
export enum AnalysisSource {
  Registration = "registration",
  Listing = "listing",
  Manual = "manual",
}

// Free-text details a buyer can type in when there's no reg / no listing URL.
export const manualDetailsSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().optional(),
  mileage: z.number().int().nonnegative().optional(),
  fuelType: z.string().optional(),
  notes: z.string().optional(),
  images: z.array(extractedImageSchema).optional(),
});

export const vehicleVerdictRequestSchema = z
  .object({
    // At least one source must be present (enforced below).
    registration: z.string().min(2).max(10).optional(),
    listingUrl: z.string().url().optional(),
    // A confirmed/edited listing snapshot (from the scrape → confirm step). When
    // present it is used as-is instead of re-scraping listingUrl.
    listing: listingSnapshotSchema.optional(),
    manual: manualDetailsSchema.optional(),
    // The money the buyer has for the whole purchase (car + near-term costs).
    totalBudget: z.number().positive(),
    // The price on the table (asking price or current bid). If absent, Ralph
    // estimates typical market value itself and flags it as an estimate.
    askingPrice: z.number().nonnegative().optional(),
    postcode: z.string().optional(),
  })
  .refine((r) => Boolean(r.registration || r.listingUrl || r.listing || r.manual), {
    message: "Provide at least a registration, a listing URL, or manual details.",
  });

// A meaning-first read: `title` is the plain-English "what this means for you",
// `evidence` is the underlying data that supports it.
export const verdictFindingSchema = z.object({
  tone: z.enum(FindingTone),
  title: z.string(),
  evidence: z.string(),
});

export const budgetFitSchema = z.object({
  rating: z.enum(BudgetFitCode),
  note: z.string(),
});

// NOTE: this schema is sent to OpenAI as a strict json_schema. Strict mode
// requires EVERY property to be listed in `required`, so unknown numbers are
// `.nullable()` (required, may be null) rather than `.optional()`, and arrays
// are always present rather than `.default([])`.
export const valueEstimateSchema = z.object({
  typicalPriceLow: z.number().nonnegative().nullable(),
  typicalPriceHigh: z.number().nonnegative().nullable(),
  // How Ralph arrived at the figure (asking price given, or AI estimate basis).
  basis: z.string(),
});

export const runningCostOutlookSchema = z.object({
  nearTermRepairLow: z.number().nonnegative().nullable(),
  nearTermRepairHigh: z.number().nonnegative().nullable(),
  note: z.string(),
});

// Price guidance appears only when there's a price on the table (an asking price
// or a listing). Framing adapts per source: auction -> "max sensible bid /
// walk away above"; marketplace -> "worth offering"; dealer -> price-fit context.
export const priceGuidanceSchema = z.object({
  maxSensible: z.number().nonnegative().nullable(),
  walkAwayAbove: z.number().nonnegative().nullable(),
  framing: z.string(),
  note: z.string(),
});

export const vehicleVerdictResultSchema = z.object({
  verdict: z.enum(VehicleVerdictCode),
  confidence: z.enum(ExtractionConfidence),
  // One-line plain verdict shown in the hero.
  headline: z.string(),
  // Ralph's read — a short, human paragraph.
  summary: z.string(),
  budgetFit: budgetFitSchema,
  valueEstimate: valueEstimateSchema,
  runningCost: runningCostOutlookSchema,
  // null when there's no price/listing to guide on (reg-only, budget-fit case).
  priceGuidance: priceGuidanceSchema.nullable(),
  findings: z.array(verdictFindingSchema),
  whatToCheck: z.array(z.string()),
  couldNotVerify: z.array(z.string()),
  nextStep: z.string(),
});

export const vehicleVerdictReportSchema = z.object({
  // The saved report id — lets the client deep-link / reopen it.
  id: z.string(),
  // Which inputs fed this report.
  sources: z.array(z.enum(AnalysisSource)),
  request: vehicleVerdictRequestSchema,
  // Present only when a registration was supplied (DVLA/MOT data).
  profile: vehicleProfileSchema.optional(),
  // Present only when a listing URL was supplied and scraped.
  listing: listingSnapshotSchema.optional(),
  result: vehicleVerdictResultSchema,
  generatedAt: z.string(),
});

export type VehicleVerdict = z.infer<typeof vehicleVerdictResultSchema>;
export type VehicleVerdictRequest = z.infer<typeof vehicleVerdictRequestSchema>;
export type VerdictFinding = z.infer<typeof verdictFindingSchema>;
export type BudgetFit = z.infer<typeof budgetFitSchema>;
export type ValueEstimate = z.infer<typeof valueEstimateSchema>;
export type RunningCostOutlook = z.infer<typeof runningCostOutlookSchema>;
export type PriceGuidance = z.infer<typeof priceGuidanceSchema>;
export type ManualDetails = z.infer<typeof manualDetailsSchema>;
export type VehicleVerdictReport = z.infer<typeof vehicleVerdictReportSchema>;
