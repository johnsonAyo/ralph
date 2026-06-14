import { CreateReportRequest, ListingSnapshot, ReportResult } from "@auction-risk/shared";

export interface RalphAnalyserPort {
  analyse(input: {
    request: CreateReportRequest;
    listing: ListingSnapshot;
  }): Promise<ReportResult>;
}
