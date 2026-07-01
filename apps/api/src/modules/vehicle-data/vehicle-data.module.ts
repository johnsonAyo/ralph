import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { AiModule } from "@/modules/ai/ai.module";
import { ExtractionModule } from "@/modules/extraction/extraction.module";
import { VEHICLE_DATA_PROVIDERS } from "./domain/vehicle-data-provider.interface";
import { DvlaVesProvider } from "./infrastructure/dvla-ves.provider";
import { DvsaMotProvider } from "./infrastructure/dvsa-mot.provider";
import { LookupVehicleUseCase } from "./application/lookup-vehicle.use-case";
import { AnalyseVehicleVerdictUseCase } from "./application/analyse-vehicle-verdict.use-case";
import { VehicleDataController } from "./vehicle-data.controller";
import { ReportsModule } from "@/modules/reports/reports.module";

@Module({
  imports: [AuthModule, AiModule, ReportsModule, ExtractionModule],
  controllers: [VehicleDataController],
  providers: [
    DvlaVesProvider,
    DvsaMotProvider,
    {
      provide: VEHICLE_DATA_PROVIDERS,
      useFactory: (dvla: DvlaVesProvider, mot: DvsaMotProvider) => [dvla, mot],
      inject: [DvlaVesProvider, DvsaMotProvider],
    },
    LookupVehicleUseCase,
    AnalyseVehicleVerdictUseCase,
  ],
  exports: [LookupVehicleUseCase],
})
export class VehicleDataModule {}
