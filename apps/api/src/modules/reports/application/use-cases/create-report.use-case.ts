import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { CreditCheckerPort } from "@/modules/credits/domain/credit-checker.port";
import { RalphAnalyserPort } from "@/modules/ai/domain/ralph-analyser.port";
import { ListingExtractorPort } from "@/modules/extraction/domain/listing-extractor.port";
import { CREDIT_SERVICE, LISTING_EXTRACTOR, RALPH_ANALYSER, REPORT_REPOSITORY, } from "@/common/tokens";
import { CreateReportRequest, ExtractionConfidence, ReportSnapshot } from "@ralph/shared";
import { Report } from "@/modules/reports/domain/report.entity";
import { ReportRepository } from "@/modules/reports/domain/report.repository";
@Injectable()
export class CreateReportUseCase {
    constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly reports: ReportRepository, 
    @Inject(CREDIT_SERVICE)
    private readonly credits: CreditCheckerPort, 
    @Inject(LISTING_EXTRACTOR)
    private readonly extractor: ListingExtractorPort, 
    @Inject(RALPH_ANALYSER)
    private readonly ralph: RalphAnalyserPort) { }
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
        await this.credits.reserveReportCredit(input.userId, report.toSnapshot().id);
        await this.reports.save(report);

        if (input.request.listing) {
            report.attachListing(input.request.listing, now);
            report.markAnalysing(now);
            await this.reports.save(report);
            try {
                const result = await this.ralph.analyse({
                    request: input.request,
                    listing: input.request.listing,
                });
                report.complete(result, now);
                await this.reports.save(report);
                return report.toSnapshot();
            }
            catch (error) {
                report.fail(now);
                await this.reports.save(report);
                throw error;
            }
        }

        try {
            report.markExtracting(now);
            await this.reports.save(report);
            const listing = await this.extractor.extract(input.request.listingUrl);
            report.attachListing(listing, now);
            report.needsUserConfirmation(now);
            await this.reports.save(report);
            return report.toSnapshot();
        }
        catch (error) {
            report.fail(now);
            await this.reports.save(report);
            throw error;
        }
    }
}
