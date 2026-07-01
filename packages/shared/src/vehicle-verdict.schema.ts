import { z } from "zod";
import { ExtractionConfidence } from "./listing.schema";
import { vehicleProfileSchema } from "./vehicle.schema";

// The reg-flow report: registration -> DVLA/MOT data -> AI verdict, judged
// against the user's budget. This is Ralph's advisory output, NOT a data dump:
// every finding leads with what it MEANS for the buyer, evidence underneath.

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

export const vehicleVerdictRequestSchema = z.object({
  registration: z.string().min(2).max(10),
  // The money the buyer has for the whole purchase (car + near-term costs).
  totalBudget: z.number().positive(),
  // Optional: the price they're being asked to pay. If absent, Ralph estimates
  // typical market value itself and flags it as an estimate.
  askingPrice: z.number().nonnegative().optional(),
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
  findings: z.array(verdictFindingSchema),
  whatToCheck: z.array(z.string()),
  couldNotVerify: z.array(z.string()),
  nextStep: z.string(),
});

export const vehicleVerdictReportSchema = z.object({
  request: vehicleVerdictRequestSchema,
  profile: vehicleProfileSchema,
  result: vehicleVerdictResultSchema,
  generatedAt: z.string(),
});

export type VehicleVerdict = z.infer<typeof vehicleVerdictResultSchema>;
export type VehicleVerdictRequest = z.infer<typeof vehicleVerdictRequestSchema>;
export type VerdictFinding = z.infer<typeof verdictFindingSchema>;
export type BudgetFit = z.infer<typeof budgetFitSchema>;
export type ValueEstimate = z.infer<typeof valueEstimateSchema>;
export type RunningCostOutlook = z.infer<typeof runningCostOutlookSchema>;
export type VehicleVerdictReport = z.infer<typeof vehicleVerdictReportSchema>;
