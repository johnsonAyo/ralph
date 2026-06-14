import { CreateReportRequest, ListingSnapshot, ReportResult } from "@ralph/shared";

export interface RalphAnalyserPort {
  analyse(input: {
    request: CreateReportRequest;
    listing: ListingSnapshot;
  }): Promise<ReportResult>;
}
