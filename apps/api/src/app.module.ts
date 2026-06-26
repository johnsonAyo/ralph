import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfigSchema } from "@/common/config/app-config.schema";
import { AiModule } from "@/modules/ai/ai.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { CreditsModule } from "@/modules/credits/credits.module";
import { ExtractionModule } from "@/modules/extraction/extraction.module";
import { PaymentsModule } from "@/modules/payments/payments.module";
import { ReportsModule } from "@/modules/reports/reports.module";
import { SupabaseModule } from "@/modules/supabase/supabase.module";
import { AppLoggerService } from "@/common/logging/app-logger.service";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const parsed = appConfigSchema.safeParse(config);

        if (!parsed.success) {
          throw new Error(
            `Invalid application configuration: ${parsed.error.message}`,
          );
        }

        return parsed.data;
      },
    }),
    SupabaseModule,
    AuthModule,
    CreditsModule,
    ExtractionModule,
    AiModule,
    ReportsModule,
    PaymentsModule,
  ],
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class AppModule {}

