import { Module } from "@nestjs/common";
import { RALPH_ANALYSER } from "@/common/tokens";
import { OpenAiRalphAnalyserService } from "./infrastructure/openai-ralph-analyser.service";


@Module({
  providers: [
    OpenAiRalphAnalyserService,
    {
      provide: RALPH_ANALYSER,
      useExisting: OpenAiRalphAnalyserService,
    },
  ],
  exports: [RALPH_ANALYSER],
})
export class AiModule {}
