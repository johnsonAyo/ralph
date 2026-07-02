import { Inject, Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import {
  AnalysisSource,
  ListingSnapshot,
  VehicleProfile,
  VehicleSourceType,
  VehicleVerdictReport,
  VehicleVerdictRequest,
} from "@ralph/shared";
import { VEHICLE_VERDICT_ANALYSER, REPORT_REPOSITORY, LISTING_EXTRACTOR } from "@/common/tokens";
import { VehicleVerdictAnalyserPort } from "@/modules/ai/domain/vehicle-verdict-analyser.port";
import { ListingExtractorPort } from "@/modules/extraction/domain/listing-extractor.port";
import { ValidationError } from "@/common/errors/app.error";
import { LookupVehicleUseCase } from "./lookup-vehicle.use-case";
import { ReportRepository } from "@/modules/reports/domain/report.repository";
import { Report } from "@/modules/reports/domain/report.entity";

// Unified analysis: gather whatever inputs were provided (registration -> MOT,
// listing URL -> scrape, manual details), then run ONE adaptive AI verdict over
// the combined evidence. The inputs present decide how rich the report is.
@Injectable()
export class AnalyseVehicleVerdictUseCase {
  private readonly logger = new Logger(AnalyseVehicleVerdictUseCase.name);

  constructor(
    private readonly lookup: LookupVehicleUseCase,
    @Inject(VEHICLE_VERDICT_ANALYSER)
    private readonly analyser: VehicleVerdictAnalyserPort,
    @Inject(LISTING_EXTRACTOR)
    private readonly extractor: ListingExtractorPort,
    @Inject(REPORT_REPOSITORY)
    private readonly repository: ReportRepository,
  ) {}

  async execute(request: VehicleVerdictRequest, userId: string): Promise<VehicleVerdictReport> {
    const sources: AnalysisSource[] = [];
    const soleSource = this.soleSource(request);

    // 1. Registration -> DVLA/MOT profile.
    let profile: VehicleProfile | undefined;
    if (request.registration) {
      try {
        profile = await this.lookup.execute(request.registration);
        sources.push(AnalysisSource.Registration);
      } catch (error) {
        // If the reg is the only thing we have, surface the "not found" error.
        // Otherwise carry on and let the analyser note the missing MOT data.
        if (soleSource === "registration") throw error;
        this.logger.warn(`Reg lookup failed, continuing without it: ${(error as Error).message}`);
      }
    }

    // 2. Listing. Prefer a confirmed/edited snapshot from the confirm step;
    // otherwise scrape the URL.
    let listing: ListingSnapshot | undefined;
    if (request.listing) {
      listing = request.listing;
      sources.push(AnalysisSource.Listing);
    } else if (request.listingUrl) {
      try {
        listing = await this.extractor.extract(request.listingUrl);
        sources.push(AnalysisSource.Listing);
      } catch (error) {
        if (soleSource === "listing") throw error;
        this.logger.warn(`Listing extract failed, continuing without it: ${(error as Error).message}`);
      }
    }

    // 3. Manual details.
    if (request.manual) {
      sources.push(AnalysisSource.Manual);
    }

    if (sources.length === 0) {
      throw new ValidationError(
        "We couldn't gather any data for that input. Check the registration or listing link, or enter details manually.",
      );
    }

    const result = await this.analyser.analyse({ request, profile, listing });

    const reportId = randomUUID();
    const requestId = randomUUID();
    const now = new Date().toISOString();
    const reportEntity = Report.createRegCheck({
      id: reportId,
      userId,
      requestId,
      // An auction-sourced or listing-backed check is an "auction"-type report;
      // otherwise reg_check.
      type:
        request.sourceType === VehicleSourceType.Auction || request.listingUrl
          ? "auction"
          : "reg_check",
      request,
      profile,
      listing,
      result,
      now,
    });
    await this.repository.save(reportEntity);

    return {
      id: reportId,
      sources,
      request,
      profile,
      listing,
      result,
      generatedAt: now,
    };
  }

  private soleSource(request: VehicleVerdictRequest): "registration" | "listing" | "manual" | null {
    const present = [
      request.registration ? "registration" : null,
      request.listingUrl || request.listing ? "listing" : null,
      request.manual ? "manual" : null,
    ].filter(Boolean) as ("registration" | "listing" | "manual")[];
    return present.length === 1 ? present[0] : null;
  }
}
