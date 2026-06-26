import { z } from "zod";
import {
  RALPH_ANALYSIS_MAX_IMAGES,
  RALPH_ANALYSIS_MAX_OUTPUT_TOKENS,
} from "./ralph-analysis.constants";
import { reportResultSchema } from "@ralph/shared";
import { RalphAnalysisContext } from "../domain/ralph-analysis-context";

const RALPH_BUYER_PROTECTION_INSTRUCTIONS = [
  "You are Ralph, an independent UK auction car buyer-protection analyst.",
  "Use only the provided request, extracted listing data, and listing photos.",
  "Do not invent missing values or claim certainty when the evidence is incomplete.",
  "This is a decision report, not a chat response.",
  "Return concise buyer-facing guidance in the exact JSON schema requested.",
  "Use the user's total budget as the full spend ceiling, including auction fees, delivery, and repair allowance where relevant.",
  "If the evidence is weak, state that clearly and keep the verdict conservative.",
  "Produce a report that answers whether the listing fits the user's real budget and risk tolerance.",
  "Primary outputs: verdict, confidence, safe bid range, hard ceiling, estimated total cost, summary, key risks, assumptions, and next step.",
  "If a numeric field cannot be supported, omit it rather than guessing.",
  "If the listing data is incomplete, explain the uncertainty in plain language.",
].join(" ");

function toAnalysisImageUrls(listing: RalphAnalysisContext["listing"]) {
  return listing.images
    .slice(0, RALPH_ANALYSIS_MAX_IMAGES)
    .map((image) => image.highResUrl ?? image.fullUrl)
    .filter((url, index, urls) => urls.indexOf(url) === index);
}

export interface SharedRalphAnalysisContext {
  instructions: string;
  userPayload: string;
  imageUrls: string[];
  jsonSchema: Record<string, unknown>;
  maxTokens: number;
}

export function buildSharedAnalysisContext(
  context: RalphAnalysisContext,
): SharedRalphAnalysisContext {
  const imageUrls = toAnalysisImageUrls(context.listing);
  const jsonSchema = z.toJSONSchema(reportResultSchema) as Record<string, unknown>;
  const userPayload = JSON.stringify(
    {
      request: context.request,
      listing: {
        ...context.listing,
        images: context.listing.images.map((image) => ({
          sequence: image.sequence,
          label: image.label,
          thumbnailUrl: image.thumbnailUrl,
          fullUrl: image.fullUrl,
          highResUrl: image.highResUrl,
        })),
      },
      selectedImageUrls: imageUrls,
    },
    null,
    2,
  );

  return {
    instructions: RALPH_BUYER_PROTECTION_INSTRUCTIONS,
    userPayload,
    imageUrls,
    jsonSchema,
    maxTokens: RALPH_ANALYSIS_MAX_OUTPUT_TOKENS,
  };
}
