import { CreateReportRequest, ListingSnapshot, ReportResult, ReportSnapshot, ReportStatus, ReportStatusCode, } from "@ralph/shared";
export class Report {
    private constructor(private readonly props: ReportSnapshot) { }
    static create(input: {
        id: string;
        userId: string;
        request: CreateReportRequest;
        now: string;
    }): Report {
        return new Report({
            id: input.id,
            userId: input.userId,
            type: "auction",
            request: input.request,
            status: ReportStatusCode.Queued,
            createdAt: input.now,
            updatedAt: input.now,
        });
    }
    static createRegCheck(input: {
        id: string;
        userId: string;
        request: any;
        profile: any;
        result: any;
        now: string;
    }): Report {
        return new Report({
            id: input.id,
            userId: input.userId,
            type: "reg_check",
            request: input.request,
            profile: input.profile,
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
        this.props.updatedAt = now;
    }
    markAnalysing(now: string): void {
        this.setStatus(ReportStatusCode.Analysing, now);
    }
    complete(result: ReportResult, now: string): void {
        this.props.result = result;
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
