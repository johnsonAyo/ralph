import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { SupabaseJwtGuard } from "@/modules/auth/supabase-jwt.guard";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import {
  VehicleLookupRequest,
  vehicleLookupRequestSchema,
} from "@ralph/shared";
import { LookupVehicleUseCase } from "./application/lookup-vehicle.use-case";

@UseGuards(SupabaseJwtGuard)
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
