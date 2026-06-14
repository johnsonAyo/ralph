import { Injectable } from "@nestjs/common";
import {
  ExtractionConfidence,
  ReportResult,
  ReportVerdictCode,
  reportResultSchema,
} from "@auction-risk/shared";
import { RalphAnalyserPort } from "@/modules/ai/domain/ralph-analyser.port";


@Injectable()
export class OpenAiRalphAnalyserService implements RalphAnalyserPort {
  async analyse(): Promise<ReportResult> {
    // TODO: Wire OpenAI Responses API here.
    // Send the normalized listing snapshot, selected image URLs, budget inputs,
    // and the Ralph report schema. The model should never invent missing fields.
    return reportResultSchema.parse({
      verdict: ReportVerdictCode.InsufficientConfidence,
      confidence: ExtractionConfidence.Low,
      summary:
        "Ralph needs the live extraction and image analysis implementation before this report can give bid guidance.",
      keyRisks: ["Live extractor is not wired yet."],
      assumptions: ["This is a scaffold response."],
      recommendedNextStep: "Wire Playwright extraction, then run the report again.",
    });
  }
}
