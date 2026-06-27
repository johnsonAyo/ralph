import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { reportResultSchema, ReportResult } from "@ralph/shared";
import { AppError } from "@/common/errors/app.error";
import { OPENAI_CLIENT } from "@/common/tokens";
import { RalphAnalyserPort } from "@/modules/ai/domain/ralph-analyser.port";
import { buildSharedAnalysisContext } from "./ralph-analysis.prompt";
import { RALPH_ANALYSIS_MODEL_FALLBACK, RALPH_ANALYSIS_RESPONSE_FORMAT, } from "./ralph-analysis.constants";
import { RalphAnalysisContext } from "../domain/ralph-analysis-context";
@Injectable()
export class OpenAiRalphAnalyserService implements RalphAnalyserPort {
    constructor(
    @Inject(OPENAI_CLIENT)
    private readonly openai: OpenAI, private readonly config: ConfigService) { }
    async analyse(input: RalphAnalysisContext): Promise<ReportResult> {
        const model = this.config.get<string>("OPENAI_MODEL") ?? RALPH_ANALYSIS_MODEL_FALLBACK;
        const ctx = buildSharedAnalysisContext(input);
        try {
            const response = await this.openai.responses.create({
                model,
                instructions: ctx.instructions,
                input: [
                    {
                        role: "user",
                        content: [
                            { type: "input_text", text: ctx.userPayload },
                            ...ctx.imageUrls.map((imageUrl) => ({
                                type: "input_image" as const,
                                detail: "high" as const,
                                image_url: imageUrl,
                            })),
                        ],
                    },
                ],
                text: {
                    format: {
                        type: "json_schema",
                        name: RALPH_ANALYSIS_RESPONSE_FORMAT,
                        schema: ctx.jsonSchema,
                        strict: true,
                        description: "Structured Ralph report for UK auction car buyer protection.",
                    },
                },
                max_output_tokens: ctx.maxTokens,
                metadata: {
                    analysis_type: RALPH_ANALYSIS_RESPONSE_FORMAT,
                    platform: input.listing.platform,
                },
            });
            if (!response.output_text) {
                throw new AppError("OpenAI returned an empty Ralph analysis response.", 502, "OPENAI_EMPTY_RESPONSE");
            }
            return reportResultSchema.parse(JSON.parse(response.output_text));
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                throw new AppError("OpenAI returned malformed JSON for the Ralph report.", 502, "OPENAI_INVALID_JSON", error.message);
            }
            if (error instanceof AppError) {
                throw error;
            }
            const message = error instanceof Error ? error.message : "Unknown OpenAI error.";
            throw new AppError("Unable to generate the Ralph analysis report.", 502, "OPENAI_ANALYSIS_FAILED", message);
        }
    }
}
