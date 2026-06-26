import assert from "node:assert/strict";
import test from "node:test";
import {
  ExtractionConfidence,
  ReportResult,
  ReportVerdictCode,
} from "@ralph/shared";
import { AppError } from "@/common/errors/app.error";
import { FallbackRalphAnalyserService } from "@/modules/ai/infrastructure/fallback-ralph-analyser.service";
import { RalphAnalyserPort } from "@/modules/ai/domain/ralph-analyser.port";
import { RalphAnalysisContext } from "@/modules/ai/domain/ralph-analysis-context";

const stubContext: RalphAnalysisContext = {
  request: {} as RalphAnalysisContext["request"],
  listing: {} as RalphAnalysisContext["listing"],
};

const primaryResult: ReportResult = {
  verdict: ReportVerdictCode.GoodCandidate,
  confidence: ExtractionConfidence.High,
  summary: "primary-output",
  keyRisks: [],
  assumptions: [],
  recommendedNextStep: "primary-next-step",
};

const fallbackResult: ReportResult = {
  verdict: ReportVerdictCode.HighRisk,
  confidence: ExtractionConfidence.Medium,
  summary: "fallback-output",
  keyRisks: [],
  assumptions: [],
  recommendedNextStep: "fallback-next-step",
};

function fakeAnalyser(outcome: ReportResult | AppError): RalphAnalyserPort {
  return {
    analyse: async () => {
      if (outcome instanceof AppError) {
        throw outcome;
      }
      return outcome;
    },
  };
}

test("returns the primary result when the primary analyser succeeds", async () => {
  const service = new FallbackRalphAnalyserService(
    fakeAnalyser(primaryResult),
    fakeAnalyser(fallbackResult),
  );

  const result = await service.analyse(stubContext);

  assert.equal(result.summary, "primary-output");
});

test("returns the fallback result when the primary analyser throws", async () => {
  const service = new FallbackRalphAnalyserService(
    fakeAnalyser(new AppError("OpenAI is down", 502, "OPENAI_ANALYSIS_FAILED")),
    fakeAnalyser(fallbackResult),
  );

  const result = await service.analyse(stubContext);

  assert.equal(result.summary, "fallback-output");
});

test("throws the fallback analyser error when both providers fail", async () => {
  const service = new FallbackRalphAnalyserService(
    fakeAnalyser(new AppError("OpenAI is down", 502, "OPENAI_ANALYSIS_FAILED")),
    fakeAnalyser(new AppError("Ollama is down", 502, "OLLAMA_ANALYSIS_FAILED")),
  );

  await assert.rejects(
    () => service.analyse(stubContext),
    (err: unknown) => {
      assert.ok(err instanceof AppError);
      assert.equal((err as AppError).code, "OLLAMA_ANALYSIS_FAILED");
      return true;
    },
  );
});
