import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { OPENAI_CLIENT, RALPH_ANALYSER } from "@/common/tokens";
import { OpenAiRalphAnalyserService } from "./infrastructure/openai-ralph-analyser.service";
import { OllamaRalphAnalyserService } from "./infrastructure/ollama-ralph-analyser.service";
import { FallbackRalphAnalyserService } from "./infrastructure/fallback-ralph-analyser.service";
import { RalphAnalyserPort } from "./domain/ralph-analyser.port";
@Module({
    providers: [
        {
            provide: OPENAI_CLIENT,
            inject: [ConfigService],
            useFactory: (config: ConfigService): OpenAI => {
                const apiKey = config.getOrThrow<string>("OPENAI_API_KEY");
                return new OpenAI({ apiKey });
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
    ],
    exports: [RALPH_ANALYSER, OPENAI_CLIENT],
})
export class AiModule {
}
