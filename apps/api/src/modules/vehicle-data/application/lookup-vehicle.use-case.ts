import { Inject, Injectable, Logger } from "@nestjs/common";
import { VehicleProfile } from "@ralph/shared";
import { ValidationError } from "@/common/errors/app.error";
import {
  VehicleDataProvider,
  VEHICLE_DATA_PROVIDERS,
} from "../domain/vehicle-data-provider.interface";
import { buildVehicleProfile } from "./build-vehicle-profile";

@Injectable()
export class LookupVehicleUseCase {
  private readonly logger = new Logger(LookupVehicleUseCase.name);

  constructor(
    @Inject(VEHICLE_DATA_PROVIDERS)
    private readonly providers: VehicleDataProvider[],
  ) {}

  async execute(registration: string): Promise<VehicleProfile> {
    const active = this.providers.filter((p) => p.isConfigured());
    if (active.length === 0) {
      throw new ValidationError(
        "No vehicle data sources are configured. Set the DVLA / DVSA credentials.",
      );
    }

    const results = await Promise.all(
      active.map(async (provider) => {
        try {
          const patch = await provider.fetch(registration);
          return patch ? { source: provider.name, patch } : null;
        } catch (error) {
          this.logger.warn(`[${provider.name}] lookup failed: ${(error as Error).message}`);
          return null;
        }
      }),
    );

    const patches = results.filter((r): r is NonNullable<typeof r> => r !== null);
    if (patches.length === 0) {
      throw new ValidationError(
        "We couldn't find that registration. Check it and try again, or enter the details manually.",
      );
    }

    return buildVehicleProfile({ registration, patches });
  }
}
