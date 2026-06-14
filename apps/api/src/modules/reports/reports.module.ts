import { Module } from "@nestjs/common";
import { REPORT_REPOSITORY } from "@/common/tokens";
import { AiModule } from "@/modules/ai/ai.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { CreditsModule } from "@/modules/credits/credits.module";
import { ExtractionModule } from "@/modules/extraction/extraction.module";
import { CreateReportUseCase } from "./application/use-cases/create-report.use-case";
import { SupabaseReportRepository } from "./infrastructure/supabase-report.repository";
import { ReportsController } from "./reports.controller";


@Module({
  imports: [AuthModule, CreditsModule, ExtractionModule, AiModule],
  controllers: [ReportsController],
  providers: [
    CreateReportUseCase,
    SupabaseReportRepository,
    {
      provide: REPORT_REPOSITORY,
      useExisting: SupabaseReportRepository,
    },
  ],
})
export class ReportsModule {}
