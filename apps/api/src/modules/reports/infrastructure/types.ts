export type ReportRow = {
    id: string;
    user_id: string;
    type: string;
    status: string;
    request_id: string;
    listing_id?: string | null;
    verdict_id?: string | null;
    request?: unknown;
    listing?: unknown;
    profile: unknown;
    result?: unknown;
    created_at: string;
    updated_at: string;
};
