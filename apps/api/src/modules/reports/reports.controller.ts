import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/modules/auth/current-user.decorator";
import { SupabaseJwtGuard } from "@/modules/auth/supabase-jwt.guard";
import { AuthenticatedUser } from "@/modules/auth/types";
import { REPORT_REPOSITORY, LISTING_EXTRACTOR } from "@/common/tokens";
import { ReportRepository } from "@/modules/reports/domain/report.repository";
import { ListingExtractorPort } from "@/modules/extraction/domain/listing-extractor.port";
import { CreateReportRequest, createReportRequestSchema, } from "@/modules/reports/application/dto/create-report.dto";
import { CreateReportUseCase } from "@/modules/reports/application/use-cases/create-report.use-case";
import { ConfirmReportUseCase } from "./application/use-cases/confirm-report.use-case";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { NotFoundError } from "@/common/errors/app.error";
import { ListingSnapshot } from "@ralph/shared";
@UseGuards(SupabaseJwtGuard)
@Controller("reports")
export class ReportsController {
    constructor(
      private readonly createReport: CreateReportUseCase,
      private readonly confirmReport: ConfirmReportUseCase,
      @Inject(REPORT_REPOSITORY) private readonly reports: ReportRepository,
      @Inject(LISTING_EXTRACTOR) private readonly extractor: ListingExtractorPort,
    ) { }
    @Post()
    async create(
    @CurrentUser()
    user: AuthenticatedUser, 
    @Body(new ZodValidationPipe(createReportRequestSchema))
    request: CreateReportRequest) {
        return this.createReport.execute({
            userId: user.id,
            request,
        });
    }
    @Post("preview-listing")
    async previewListing(
    @Body()
    body: {
        listingUrl: string;
    }) {
        return this.extractor.extract(body.listingUrl);
    }
    @Post(":id/confirm")
    async confirm(
    @CurrentUser()
    user: AuthenticatedUser, 
    @Param("id", ParseUUIDPipe)
    id: string, 
    @Body()
    body: {
        listing: ListingSnapshot;
    }) {
        return this.confirmReport.execute({
            userId: user.id,
            reportId: id,
            listing: body.listing,
        });
    }
    @Get()
    async findAll(
    @CurrentUser()
    user: AuthenticatedUser) {
        const reports = await this.reports.findByUserId(user.id);
        return reports.map((report) => report.toSnapshot());
    }
    @Get(":id")
    async findOne(
    @Param("id", ParseUUIDPipe)
    id: string) {
        const report = await this.reports.findById(id);
        if (!report) {
            throw new NotFoundError("Report not found.");
        }
        return report.toSnapshot();
    }
}
