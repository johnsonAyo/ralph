import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { vehicleVerdictResultSchema, VehicleVerdict } from "@ralph/shared";
import { AppError } from "@/common/errors/app.error";
import { OPENAI_CLIENT } from "@/common/tokens";
import { VehicleVerdictAnalyserPort } from "../domain/vehicle-verdict-analyser.port";
import { VehicleVerdictContext } from "../domain/vehicle-verdict-context";
import { buildVehicleVerdictContext } from "./vehicle-verdict.prompt";
import { RALPH_ANALYSIS_MODEL_FALLBACK } from "./ralph-analysis.constants";

const VEHICLE_VERDICT_RESPONSE_FORMAT = "ralph_vehicle_verdict";
const VEHICLE_VERDICT_MAX_OUTPUT_TOKENS = 1200;

@Injectable()
export class OpenAiVehicleVerdictService implements VehicleVerdictAnalyserPort {
  constructor(
    @Inject(OPENAI_CLIENT)
    private readonly openai: OpenAI | null,
    private readonly config: ConfigService,
  ) {}

  async analyse(input: VehicleVerdictContext): Promise<VehicleVerdict> {
    if (!this.openai) {
      throw new AppError(
        "OpenAI analysis is not configured. Set OPENAI_API_KEY in apps/api/.env.",
        500,
        "OPENAI_NOT_CONFIGURED",
      );
    }
    const model = this.config.get<string>("OPENAI_MODEL") ?? RALPH_ANALYSIS_MODEL_FALLBACK;
    const ctx = buildVehicleVerdictContext(input);
    try {
      const response = await this.openai.responses.create({
        model,
        instructions: ctx.instructions,
        input: [
          {
            role: "user",
            content: [{ type: "input_text", text: ctx.userPayload }],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: VEHICLE_VERDICT_RESPONSE_FORMAT,
            schema: ctx.jsonSchema,
            strict: true,
            description: "Ralph's reg-based used-car budget verdict for a UK buyer.",
          },
        },
        max_output_tokens: VEHICLE_VERDICT_MAX_OUTPUT_TOKENS,
        metadata: {
          analysis_type: VEHICLE_VERDICT_RESPONSE_FORMAT,
          registration: input.profile.registration ?? "unknown",
        },
      });
      if (!response.output_text) {
        throw new AppError("OpenAI returned an empty verdict response.", 502, "OPENAI_EMPTY_RESPONSE");
      }
      return vehicleVerdictResultSchema.parse(JSON.parse(response.output_text));
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new AppError("OpenAI returned malformed JSON for the verdict.", 502, "OPENAI_INVALID_JSON", error.message);
      }
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : "Unknown OpenAI error.";
      throw new AppError("Unable to generate the Ralph verdict.", 502, "OPENAI_VERDICT_FAILED", message);
    }
  }
}
