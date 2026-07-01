import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { OPENAI_CLIENT, RALPH_ANALYSER, VEHICLE_VERDICT_ANALYSER } from "@/common/tokens";
import { OpenAiRalphAnalyserService } from "./infrastructure/openai-ralph-analyser.service";
import { OllamaRalphAnalyserService } from "./infrastructure/ollama-ralph-analyser.service";
import { FallbackRalphAnalyserService } from "./infrastructure/fallback-ralph-analyser.service";
import { OpenAiVehicleVerdictService } from "./infrastructure/openai-vehicle-verdict.service";
import { OllamaVehicleVerdictService } from "./infrastructure/ollama-vehicle-verdict.service";
import { RalphAnalyserPort } from "./domain/ralph-analyser.port";
import { VehicleVerdictAnalyserPort } from "./domain/vehicle-verdict-analyser.port";
@Module({
    providers: [
        {
            provide: OPENAI_CLIENT,
            inject: [ConfigService],
            useFactory: (config: ConfigService): OpenAI | null => {
                const apiKey = config.get<string>("OPENAI_API_KEY");
                return apiKey ? new OpenAI({ apiKey }) : null;
            },
        },
        OpenAiRalphAnalyserService,
        OllamaRalphAnalyserService,
        {
            provide: RALPH_ANALYSER,
            inject: [ConfigService, OpenAiRalphAnalyserService, OllamaRalphAnalyserService],
            useFactory: (config: ConfigService, openAiAnalyser: RalphAnalyserPort, ollamaAnalyser: RalphAnalyserPort): RalphAnalyserPort => {
                const hasOpenAi = Boolean(config.get<string>("OPENAI_API_KEY"));
                const hasOllama = Boolean(config.get<string>("OLLAMA_URL"));
                if (!hasOpenAi && !hasOllama) {
                    throw new Error("Ralph analyser requires at least one LLM provider. Set OPENAI_API_KEY or OLLAMA_URL in apps/api/.env.");
                }
                if (hasOpenAi && hasOllama) {
                    return new FallbackRalphAnalyserService(openAiAnalyser, ollamaAnalyser);
                }
                return hasOpenAi ? openAiAnalyser : ollamaAnalyser;
            },
        },
        // The reg-flow verdict (registration -> MOT -> budget verdict).
        // Ollama is preferred when configured (free / Ollama Cloud); OpenAI is the
        // fallback. While OpenAI is out of quota, set OLLAMA_URL to use Ollama.
        OpenAiVehicleVerdictService,
        OllamaVehicleVerdictService,
        {
            provide: VEHICLE_VERDICT_ANALYSER,
            inject: [ConfigService, OllamaVehicleVerdictService, OpenAiVehicleVerdictService],
            useFactory: (
                config: ConfigService,
                ollama: VehicleVerdictAnalyserPort,
                openai: VehicleVerdictAnalyserPort,
            ): VehicleVerdictAnalyserPort => {
                const hasOllama = Boolean(config.get<string>("OLLAMA_URL"));
                const hasOpenAi = Boolean(config.get<string>("OPENAI_API_KEY"));
                if (!hasOllama && !hasOpenAi) {
                    throw new Error("Vehicle verdict requires an LLM provider. Set OLLAMA_URL (preferred) or OPENAI_API_KEY in apps/api/.env.");
                }
                // Ollama first when available; otherwise OpenAI.
                return hasOllama ? ollama : openai;
            },
        },
    ],
    exports: [RALPH_ANALYSER, VEHICLE_VERDICT_ANALYSER, OPENAI_CLIENT],
})
export class AiModule {
}
