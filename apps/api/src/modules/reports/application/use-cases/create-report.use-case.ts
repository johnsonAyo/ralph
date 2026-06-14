import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { CreditCheckerPort } from "@/modules/credits/domain/credit-checker.port";
import { RalphAnalyserPort } from "@/modules/ai/domain/ralph-analyser.port";
import { ListingExtractorPort } from "@/modules/extraction/domain/listing-extractor.port";
import {
  CREDIT_SERVICE,
  LISTING_EXTRACTOR,
  RALPH_ANALYSER,
  REPORT_REPOSITORY,
} from "@/common/tokens";
import { CreateReportRequest, ExtractionConfidence, ReportSnapshot } from "@ralph/shared";
import { Report } from "@/modules/reports/domain/report.entity";
import { ReportRepository } from "@/modules/reports/domain/report.repository";


@Injectable()
export class CreateReportUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY) private readonly reports: ReportRepository,
    @Inject(CREDIT_SERVICE) private readonly credits: CreditCheckerPort,
    @Inject(LISTING_EXTRACTOR) private readonly extractor: ListingExtractorPort,
    @Inject(RALPH_ANALYSER) private readonly ralph: RalphAnalyserPort,
  ) {}

  async execute(input: {
    userId: string;
    request: CreateReportRequest;
  }): Promise<ReportSnapshot> {
    const now = new Date().toISOString();
    const report = Report.create({
      id: randomUUID(),
      userId: input.userId,
      request: input.request,
      now,
    });

    await this.reports.save(report);
    await this.credits.reserveReportCredit(input.userId, report.toSnapshot().id);

    try {
      report.markExtracting(new Date().toISOString());
      await this.reports.save(report);

      const listing = await this.extractor.extract(input.request.listingUrl);
      report.attachListing(listing, new Date().toISOString());

      if (listing.extractionConfidence === ExtractionConfidence.Low) {
        report.needsUserConfirmation(new Date().toISOString());
        await this.reports.save(report);
        return report.toSnapshot();
      }

      report.markAnalysing(new Date().toISOString());
      await this.reports.save(report);

      const result = await this.ralph.analyse({
        request: input.request,
        listing,
      });

      report.complete(result, new Date().toISOString());
      await this.reports.save(report);
      return report.toSnapshot();
    } catch (error) {
      report.fail(new Date().toISOString());
      await this.reports.save(report);
      throw error;
    }
  }
}
