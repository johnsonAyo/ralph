import { CreateReportRequest, ListingSnapshot } from "@ralph/shared";
export interface RalphAnalysisContext {
    request: CreateReportRequest;
    listing: ListingSnapshot;
}
