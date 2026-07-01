import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import {
  VehicleLookupRequest,
  vehicleLookupRequestSchema,
  VehicleVerdictRequest,
  vehicleVerdictRequestSchema,
} from "@ralph/shared";
import { LookupVehicleUseCase } from "./application/lookup-vehicle.use-case";
import { AnalyseVehicleVerdictUseCase } from "./application/analyse-vehicle-verdict.use-case";
import { LISTING_EXTRACTOR } from "@/common/tokens";
import { ListingExtractorPort } from "@/modules/extraction/domain/listing-extractor.port";
import { SupabaseJwtGuard } from "@/modules/auth/supabase-jwt.guard";
import { CurrentUser } from "@/modules/auth/current-user.decorator";
import { AuthenticatedUser } from "@/modules/auth/types";
import { Inject } from "@nestjs/common";

// Public: the free reg lookup (DVLA + MOT) is the no-login funnel. It reads
// public open-data only — no DB write, no credit spend — so it needs no guard.
@Controller("vehicle")
export class VehicleDataController {
  constructor(
    private readonly lookup: LookupVehicleUseCase,
    private readonly verdict: AnalyseVehicleVerdictUseCase,
    @Inject(LISTING_EXTRACTOR)
    private readonly extractor: ListingExtractorPort,
  ) {}

  @Post("lookup")
  async lookupByRegistration(
    @Body(new ZodValidationPipe(vehicleLookupRequestSchema))
    body: VehicleLookupRequest,
  ) {
    return this.lookup.execute(body.registration);
  }

  // Scrape only — returns the extracted listing for the buyer to confirm/edit
  // BEFORE any AI runs (scrapes can be faulty, so we don't trust them blind).
  @UseGuards(SupabaseJwtGuard)
  @Post("preview-listing")
  async previewListing(@Body() body: { listingUrl: string }) {
    return this.extractor.extract(body.listingUrl);
  }

  // reg + budget -> MOT/DVLA lookup -> AI verdict. Spends an OpenAI call.
  @UseGuards(SupabaseJwtGuard)
  @Post("verdict")
  async analyseVerdict(
    @Body(new ZodValidationPipe(vehicleVerdictRequestSchema))
    body: VehicleVerdictRequest,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.verdict.execute(body, user.id);
  }
}
