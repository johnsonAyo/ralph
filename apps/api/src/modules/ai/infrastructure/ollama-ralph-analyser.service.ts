import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ZodError } from "zod";
import { ReportResult, reportResultSchema } from "@ralph/shared";
import { AppError } from "@/common/errors/app.error";
import { RalphAnalyserPort } from "@/modules/ai/domain/ralph-analyser.port";
import { RalphAnalysisContext } from "@/modules/ai/domain/ralph-analysis-context";
import { buildSharedAnalysisContext } from "./ralph-analysis.prompt";
import {
  RALPH_ANALYSIS_OLLAMA_MODEL_FALLBACK,
  RALPH_ANALYSIS_TIMEOUT_MS,
} from "./ralph-analysis.constants";

interface OllamaChatResponse {
  message?: { content?: string };
}

@Injectable()
export class OllamaRalphAnalyserService implements RalphAnalyserPort {
  private readonly logger = new Logger(OllamaRalphAnalyserService.name);

  constructor(private readonly config: ConfigService) {}

  async analyse(input: RalphAnalysisContext): Promise<ReportResult> {
    const ollamaUrl = this.config.getOrThrow<string>("OLLAMA_URL").replace(/\/$/, "");
    const model =
      this.config.get<string>("OLLAMA_MODEL") ?? RALPH_ANALYSIS_OLLAMA_MODEL_FALLBACK;
    const ctx = buildSharedAnalysisContext(input);

    const imageBase64 = await this.fetchImagesAsBase64(ctx.imageUrls);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RALPH_ANALYSIS_TIMEOUT_MS);

    try {
      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          stream: false,
          format: ctx.jsonSchema,
          messages: [
            { role: "system", content: ctx.instructions },
            {
              role: "user",
              content: ctx.userPayload,
              images: imageBase64,
            },
          ],
          options: {
            num_predict: ctx.maxTokens,
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        throw new AppError(
          `Ollama returned ${response.status} for the Ralph analysis.`,
          502,
          "OLLAMA_ANALYSIS_FAILED",
          bodyText.slice(0, 500),
        );
      }

      const payload = (await response.json()) as OllamaChatResponse;
      const text = payload.message?.content;
      if (!text) {
        throw new AppError(
          "Ollama returned an empty Ralph analysis response.",
          502,
          "OLLAMA_EMPTY_RESPONSE",
        );
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (parseError) {
        throw new AppError(
          "Ollama returned malformed JSON for the Ralph report.",
          502,
          "OLLAMA_INVALID_JSON",
          parseError instanceof Error ? parseError.message : String(parseError),
        );
      }

      try {
        return reportResultSchema.parse(parsed);
      } catch (schemaError) {
        const details =
          schemaError instanceof ZodError
            ? schemaError.issues
            : schemaError instanceof Error
              ? schemaError.message
              : String(schemaError);
        throw new AppError(
          "Ollama returned a payload that did not match the Ralph report schema.",
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
        error instanceof Error &&
        (error.name === "AbortError" || /aborted/i.test(error.message));
      const code = isAbort ? "OLLAMA_ANALYSIS_TIMEOUT" : "OLLAMA_ANALYSIS_FAILED";
      const message = error instanceof Error ? error.message : "Unknown Ollama error.";

      throw new AppError(
        isAbort
          ? `Ollama timed out after ${RALPH_ANALYSIS_TIMEOUT_MS}ms.`
          : "Unable to generate the Ralph analysis report from Ollama.",
        502,
        code,
        message,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fetchImagesAsBase64(urls: string[]): Promise<string[]> {
    if (urls.length === 0) return [];

    const dropped: string[] = [];

    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            dropped.push(url);
            return null;
          }
          const buffer = await res.arrayBuffer();
          return Buffer.from(buffer).toString("base64");
        } catch {
          dropped.push(url);
          return null;
        }
      }),
    );

    if (dropped.length > 0) {
      this.logger.warn(
        `Ollama analyser dropped ${dropped.length}/${urls.length} listing photos: ${dropped.join(", ")}. Damage assessment may be weaker as a result.`,
      );
    }

    return results.filter((value): value is string => value !== null);
  }
}
