import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { VEHICLE_DATA_PROVIDERS } from "./domain/vehicle-data-provider.interface";
import { DvlaVesProvider } from "./infrastructure/dvla-ves.provider";
import { DvsaMotProvider } from "./infrastructure/dvsa-mot.provider";
import { LookupVehicleUseCase } from "./application/lookup-vehicle.use-case";
import { VehicleDataController } from "./vehicle-data.controller";

@Module({
  imports: [AuthModule],
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
  ],
  exports: [LookupVehicleUseCase],
})
export class VehicleDataModule {}
