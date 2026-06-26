import assert from "node:assert/strict";
import test from "node:test";
import { ConfigService } from "@nestjs/config";
import {
  AuctionPlatformCode,
  ExtractionConfidence,
  ReportVerdictCode,
} from "@ralph/shared";
import { OpenAiRalphAnalyserService } from "@/modules/ai/infrastructure/openai-ralph-analyser.service";
import { buildSharedAnalysisContext } from "@/modules/ai/infrastructure/ralph-analysis.prompt";

const listing = {
  platform: AuctionPlatformCode.CopartUk,
  listingUrl: "https://www.copart.co.uk/lot/49254916/example",
  lotNumber: "49254916",
  title: "2014 VAUXHALL ASTRA 2.0 CDTI 16V SRI 5DR AUTO",
  year: 2014,
  make: "VAUXHALL",
  model: "ASTRA SRI",
  mileage: 96638,
  mileageUnit: "MI",
  currentBid: 1500,
  buyItNowPrice: 2300,
  currency: "GBP",
  saleDate: "2026-06-15T09:00:00.000Z",
  location: "NEWBURY",
  category: "N REPAIRABLE NON STRUCTURAL",
  primaryDamage: "FRONT END",
  secondaryDamage: "MINOR DENTS/SCRATCHES",
  runCondition: "RUNS AND DRIVES",
  hasKeys: true,
  v5Status: "Physical V5 Available",
  estimatedRetailValue: 3258,
  images: [
    { fullUrl: "https://cdn.example.test/1.jpg", highResUrl: "https://cdn.example.test/1-hi.jpg" },
    { fullUrl: "https://cdn.example.test/2.jpg" },
  ],
  extractionConfidence: ExtractionConfidence.High,
  missingFields: [],
};

const request = {
  listingUrl: listing.listingUrl,
  totalUserBudget: 3500,
  postcode: "SW1A 1AA",
  riskTolerance: "cautious",
  repairPlan: "unknown",
};

test("buildSharedAnalysisContext exposes the buyer-protection payload in a provider-agnostic shape", () => {
  const ctx = buildSharedAnalysisContext({ request, listing } as any);

  assert.equal(ctx.instructions.includes("buyer-protection analyst"), true);
  assert.equal(ctx.instructions.includes("Primary outputs"), true);
  assert.equal(ctx.userPayload.includes(listing.listingUrl), true);
  assert.equal(ctx.userPayload.includes("\"totalUserBudget\": 3500"), true);
  assert.deepEqual(ctx.imageUrls, [
    "https://cdn.example.test/1-hi.jpg",
    "https://cdn.example.test/2.jpg",
  ]);
  assert.equal(typeof ctx.jsonSchema, "object");
  assert.notEqual(ctx.jsonSchema, null);
  assert.equal(ctx.maxTokens, 900);
});

test("OpenAiRalphAnalyserService parses the OpenAI JSON response into the shared report schema", async () => {
  const createdRequests: any[] = [];
  const fakeOpenAI = {
    responses: {
      create: async (body: any) => {
        createdRequests.push(body);
        return {
          output_text: JSON.stringify({
            verdict: ReportVerdictCode.ConsiderBelowCeiling,
            confidence: ExtractionConfidence.High,
            safeBidMin: 1200,
            safeBidMax: 1650,
            hardCeiling: 1850,
            estimatedTotalCost: 3100,
            summary: "The car can fit the budget if fees and transport stay controlled.",
            keyRisks: ["Front-end damage increases repair uncertainty."],
            assumptions: ["The auction fees stay within the normal Copart range."],
            recommendedNextStep: "Bid only if the transport and repair quotes remain inside budget.",
          }),
        };
      },
    },
  } as any;

  const config = {
    get: (key: string) => {
      if (key === "OPENAI_MODEL") return "gpt-4.1-mini";
      return undefined;
    },
    getOrThrow: (key: string) => {
      if (key === "OPENAI_API_KEY") return "test-key";
      throw new Error(`Unexpected config key: ${key}`);
    },
  } as unknown as ConfigService;

  const service = new OpenAiRalphAnalyserService(fakeOpenAI, config);
  const result = await service.analyse({ request, listing } as any);

  assert.equal(result.verdict, ReportVerdictCode.ConsiderBelowCeiling);
  assert.equal(result.confidence, ExtractionConfidence.High);
  assert.equal(result.safeBidMax, 1650);
  assert.equal(createdRequests.length, 1);
  assert.equal(createdRequests[0].model, "gpt-4.1-mini");
  assert.equal(createdRequests[0].text.format.name, "ralph_report");
  assert.equal(createdRequests[0].max_output_tokens, 900);
});
