import { Body, Controller, Post } from "@nestjs/common";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import {
  VehicleLookupRequest,
  vehicleLookupRequestSchema,
} from "@ralph/shared";
import { LookupVehicleUseCase } from "./application/lookup-vehicle.use-case";

// Public: the free reg lookup (DVLA + MOT) is the no-login funnel. It reads
// public open-data only — no DB write, no credit spend — so it needs no guard.
@Controller("vehicle")
export class VehicleDataController {
  constructor(private readonly lookup: LookupVehicleUseCase) {}

  @Post("lookup")
  async lookupByRegistration(
    @Body(new ZodValidationPipe(vehicleLookupRequestSchema))
    body: VehicleLookupRequest,
  ) {
    return this.lookup.execute(body.registration);
  }
}
