import { z } from "zod";
import { ExtractionConfidence, listingSnapshotSchema } from "./listing.schema";

export enum RiskTolerance {
  Cautious = "cautious",
  Balanced = "balanced",
  Flexible = "flexible",
}

export enum RepairPlan {
  Garage = "garage",
  PrivateRepair = "private_repair",
  Unknown = "unknown",
}

export enum ReportStatusCode {
  Queued = "queued",
  Extracting = "extracting",
  Analysing = "analysing",
  NeedsUserConfirmation = "needs_user_confirmation",
  Completed = "completed",
  Failed = "failed",
}

export enum ReportVerdictCode {
  GoodCandidate = "good_candidate",
  ConsiderBelowCeiling = "consider_below_ceiling",
  HighRisk = "high_risk",
  InsufficientConfidence = "insufficient_confidence",
}

export const createReportRequestSchema = z.object({
  listingUrl: z.string().url().optional(),
  totalUserBudget: z.number().positive(),
  postcode: z.string().min(3).max(12),
  riskTolerance: z.enum(RiskTolerance).default(RiskTolerance.Cautious),
  repairPlan: z.enum(RepairPlan).default(RepairPlan.Unknown),
  listing: listingSnapshotSchema.optional(),
});

export const reportStatusSchema = z.enum(ReportStatusCode);
export const reportVerdictSchema = z.enum(ReportVerdictCode);

export const reportResultSchema = z.object({
  verdict: reportVerdictSchema,
  confidence: z.enum(ExtractionConfidence),
  safeBidMin: z.number().nonnegative().optional(),
  safeBidMax: z.number().nonnegative().optional(),
  hardCeiling: z.number().nonnegative().optional(),
  estimatedTotalCost: z.number().nonnegative().optional(),
  summary: z.string(),
  keyRisks: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  recommendedNextStep: z.string(),
});

export const reportSnapshotSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  type: z.enum(["auction", "reg_check"]).default("auction").catch("auction"),
  status: reportStatusSchema,
  requestId: z.string().uuid(),
  request: z.any().optional(),
  listingId: z.string().uuid().optional().nullable(),
  verdictId: z.string().uuid().optional().nullable(),
  listing: listingSnapshotSchema.optional(),
  profile: z.any().optional(),
  result: z.any().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateReportRequest = z.infer<typeof createReportRequestSchema>;
export type ReportStatus = z.infer<typeof reportStatusSchema>;
export type ReportVerdict = z.infer<typeof reportVerdictSchema>;
export type ReportResult = z.infer<typeof reportResultSchema>;
export type ReportSnapshot = z.infer<typeof reportSnapshotSchema>;
