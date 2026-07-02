import { CreateReportRequest, ListingSnapshot, ReportResult, ReportSnapshot, ReportStatus, ReportStatusCode, } from "@ralph/shared";
import { randomUUID } from "node:crypto";

export class Report {
    private constructor(private readonly props: ReportSnapshot) { }
    static create(input: {
        id: string;
        userId: string;
        requestId: string;
        request: CreateReportRequest;
        now: string;
    }): Report {
        return new Report({
            id: input.id,
            userId: input.userId,
            type: "auction",
            requestId: input.requestId,
            request: input.request,
            listingId: null,
            verdictId: null,
            status: ReportStatusCode.Queued,
            createdAt: input.now,
            updatedAt: input.now,
        });
    }
    static createRegCheck(input: {
        id: string;
        userId: string;
        requestId: string;
        type?: "auction" | "reg_check";
        request: any;
        profile?: any;
        listing?: any;
        result: any;
        now: string;
    }): Report {
        return new Report({
            id: input.id,
            userId: input.userId,
            type: input.type ?? "reg_check",
            requestId: input.requestId,
            request: input.request,
            listingId: input.listing ? randomUUID() : null,
            verdictId: input.result ? randomUUID() : null,
            profile: input.profile,
            listing: input.listing,
            result: input.result,
            status: ReportStatusCode.Completed,
            createdAt: input.now,
            updatedAt: input.now,
        });
    }
    static fromSnapshot(snapshot: ReportSnapshot): Report {
        return new Report(snapshot);
    }
    markExtracting(now: string): void {
        this.setStatus(ReportStatusCode.Extracting, now);
    }
    attachListing(listing: ListingSnapshot, now: string): void {
        this.props.listing = listing;
        if (!this.props.listingId) {
            this.props.listingId = randomUUID();
        }
        this.props.updatedAt = now;
    }
    markAnalysing(now: string): void {
        this.setStatus(ReportStatusCode.Analysing, now);
    }
    complete(result: ReportResult, now: string): void {
        this.props.result = result;
        if (!this.props.verdictId) {
            this.props.verdictId = randomUUID();
        }
        this.setStatus(ReportStatusCode.Completed, now);
    }
    fail(now: string): void {
        this.setStatus(ReportStatusCode.Failed, now);
    }
    needsUserConfirmation(now: string): void {
        this.setStatus(ReportStatusCode.NeedsUserConfirmation, now);
    }
    toSnapshot(): ReportSnapshot {
        return this.props;
    }
    private setStatus(status: ReportStatus, now: string): void {
        this.props.status = status;
        this.props.updatedAt = now;
    }
}
