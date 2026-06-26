import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/modules/auth/current-user.decorator";
import { SupabaseJwtGuard } from "@/modules/auth/supabase-jwt.guard";
import { AuthenticatedUser } from "@/modules/auth/types";
import { REPORT_REPOSITORY } from "@/common/tokens";
import { ReportRepository } from "@/modules/reports/domain/report.repository";
import {
  CreateReportRequest,
  createReportRequestSchema,
} from "@/modules/reports/application/dto/create-report.dto";
import { CreateReportUseCase } from "@/modules/reports/application/use-cases/create-report.use-case";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { NotFoundError } from "@/common/errors/app.error";


@UseGuards(SupabaseJwtGuard)
@Controller("reports")
export class ReportsController {
  constructor(
    private readonly createReport: CreateReportUseCase,
    @Inject(REPORT_REPOSITORY) private readonly reports: ReportRepository,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createReportRequestSchema))
    request: CreateReportRequest,
  ) {
    return this.createReport.execute({
      userId: user.id,
      request,
    });
  }

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const reports = await this.reports.findByUserId(user.id);
    return reports.map((report) => report.toSnapshot());
  }

  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    const report = await this.reports.findById(id);

    if (!report) {
      throw new NotFoundError("Report not found.");
    }

    return report.toSnapshot();
  }
}

