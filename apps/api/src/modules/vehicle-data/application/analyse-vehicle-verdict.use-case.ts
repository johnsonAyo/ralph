import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import {
  VehicleVerdictReport,
  VehicleVerdictRequest,
} from "@ralph/shared";
import { VEHICLE_VERDICT_ANALYSER, REPORT_REPOSITORY } from "@/common/tokens";
import { VehicleVerdictAnalyserPort } from "@/modules/ai/domain/vehicle-verdict-analyser.port";
import { LookupVehicleUseCase } from "./lookup-vehicle.use-case";
import { ReportRepository } from "@/modules/reports/domain/report.repository";
import { Report } from "@/modules/reports/domain/report.entity";

@Injectable()
export class AnalyseVehicleVerdictUseCase {
  constructor(
    private readonly lookup: LookupVehicleUseCase,
    @Inject(VEHICLE_VERDICT_ANALYSER)
    private readonly analyser: VehicleVerdictAnalyserPort,
    @Inject(REPORT_REPOSITORY)
    private readonly repository: ReportRepository,
  ) {}

  async execute(request: VehicleVerdictRequest, userId: string): Promise<VehicleVerdictReport> {
    const profile = await this.lookup.execute(request.registration);
    const result = await this.analyser.analyse({ request, profile });
    
    const reportId = randomUUID();
    const now = new Date().toISOString();

    const reportEntity = Report.createRegCheck({
      id: reportId,
      userId,
      request,
      profile,
      result,
      now,
    });

    await this.repository.save(reportEntity);

    return {
      request,
      profile,
      result,
      generatedAt: now,
    };
  }
}
