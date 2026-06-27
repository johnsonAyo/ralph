import { Inject, Injectable } from "@nestjs/common";
import { RalphAnalyserPort } from "@/modules/ai/domain/ralph-analyser.port";
import { REPORT_REPOSITORY, RALPH_ANALYSER } from "@/common/tokens";
import { ReportRepository } from "@/modules/reports/domain/report.repository";
import { ReportSnapshot, ListingSnapshot } from "@ralph/shared";
import { NotFoundError, AppError } from "@/common/errors/app.error";
@Injectable()
export class ConfirmReportUseCase {
    constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly reports: ReportRepository, 
    @Inject(RALPH_ANALYSER)
    private readonly ralph: RalphAnalyserPort) { }
    async execute(input: {
        userId: string;
        reportId: string;
        listing: ListingSnapshot;
    }): Promise<ReportSnapshot> {
        const reportEntity = await this.reports.findById(input.reportId);
        if (!reportEntity) {
            throw new NotFoundError("Report not found.");
        }
        const report = reportEntity.toSnapshot();
        if (report.userId !== input.userId) {
            throw new AppError("Forbidden.", 403, "FORBIDDEN");
        }
        reportEntity.attachListing(input.listing, new Date().toISOString());
        reportEntity.markAnalysing(new Date().toISOString());
        await this.reports.save(reportEntity);
        try {
            const result = await this.ralph.analyse({
                request: report.request,
                listing: input.listing,
            });
            reportEntity.complete(result, new Date().toISOString());
            await this.reports.save(reportEntity);
            return reportEntity.toSnapshot();
        }
        catch (error) {
            reportEntity.fail(new Date().toISOString());
            await this.reports.save(reportEntity);
            throw error;
        }
    }
}
