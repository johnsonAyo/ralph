import { Module } from "@nestjs/common";
import { CREDIT_SERVICE } from "@/common/tokens";
import { SupabaseCreditCheckerService } from "./infrastructure/supabase-credit-checker.service";


@Module({
  providers: [
    SupabaseCreditCheckerService,
    {
      provide: CREDIT_SERVICE,
      useExisting: SupabaseCreditCheckerService,
    },
  ],
  exports: [CREDIT_SERVICE],
})
export class CreditsModule {}
