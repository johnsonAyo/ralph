import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ZodError } from "zod";
import { vehicleVerdictResultSchema, VehicleVerdict } from "@ralph/shared";
import { AppError } from "@/common/errors/app.error";
import { VehicleVerdictAnalyserPort } from "../domain/vehicle-verdict-analyser.port";
import { VehicleVerdictContext } from "../domain/vehicle-verdict-context";
import { buildVehicleVerdictContext } from "./vehicle-verdict.prompt";
import {
  RALPH_ANALYSIS_OLLAMA_MODEL_FALLBACK,
  RALPH_ANALYSIS_TIMEOUT_MS,
} from "./ralph-analysis.constants";

interface OllamaChatResponse {
  message?: { content?: string };
}

// Defensive: strip markdown fences and grab the outermost JSON object, in case
// the model wraps its JSON in ```json ... ``` or adds stray prose.
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : raw).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  return start !== -1 && end !== -1 && end > start ? body.slice(start, end + 1) : body;
}

// Reg-flow verdict via Ollama (local or Ollama Cloud). Cloud is selected simply
// by pointing OLLAMA_URL at https://ollama.com and setting OLLAMA_API_KEY.
@Injectable()
export class OllamaVehicleVerdictService implements VehicleVerdictAnalyserPort {
  constructor(private readonly config: ConfigService) {}

  async analyse(input: VehicleVerdictContext): Promise<VehicleVerdict> {
    const ollamaUrl = this.config.getOrThrow<string>("OLLAMA_URL").replace(/\/$/, "");
    const model = this.config.get<string>("OLLAMA_MODEL") ?? RALPH_ANALYSIS_OLLAMA_MODEL_FALLBACK;
    const apiKey = this.config.get<string>("OLLAMA_API_KEY");
    const ctx = buildVehicleVerdictContext(input);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RALPH_ANALYSIS_TIMEOUT_MS);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
      }
      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers,
        signal: controller.signal,
        // No `format` constraint: Ollama Cloud does not enforce json_schema for
        // these models, so we rely on the JSON-only instruction + the schema
        // embedded in the prompt, then parse defensively below.
        body: JSON.stringify({
          model,
          stream: false,
          messages: [
            { role: "system", content: ctx.instructions },
            { role: "user", content: ctx.userPayload },
          ],
          options: { temperature: 0.2 },
        }),
      });
      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        throw new AppError(
          `Ollama returned ${response.status} for the Ralph verdict.`,
          502,
          "OLLAMA_VERDICT_FAILED",
          bodyText.slice(0, 500),
        );
      }
      const payload = (await response.json()) as OllamaChatResponse;
      const text = payload.message?.content;
      
      if (!text) {
        throw new AppError("Ollama returned an empty verdict response.", 502, "OLLAMA_EMPTY_RESPONSE");
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(extractJson(text));
      } catch (parseError) {
        throw new AppError(
          "Ollama returned malformed JSON for the verdict.",
          502,
          "OLLAMA_INVALID_JSON",
          parseError instanceof Error ? parseError.message : String(parseError),
        );
      }
      try {
        return vehicleVerdictResultSchema.parse(parsed);
      } catch (schemaError) {
        const details =
          schemaError instanceof ZodError
            ? schemaError.issues
            : schemaError instanceof Error
              ? schemaError.message
              : String(schemaError);
        throw new AppError(
          "Ollama returned a payload that did not match the verdict schema.",
          502,
          "OLLAMA_INVALID_SCHEMA",
          details,
        );
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const isAbort =
        error instanceof Error && (error.name === "AbortError" || /aborted/i.test(error.message));
      const code = isAbort ? "OLLAMA_VERDICT_TIMEOUT" : "OLLAMA_VERDICT_FAILED";
      const message = error instanceof Error ? error.message : "Unknown Ollama error.";
      throw new AppError(
        isAbort
          ? `Ollama timed out after ${RALPH_ANALYSIS_TIMEOUT_MS}ms.`
          : "Unable to generate the Ralph verdict from Ollama.",
        502,
        code,
        message,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
