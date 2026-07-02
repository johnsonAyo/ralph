import { Inject, Injectable } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { ReportSnapshot, reportSnapshotSchema } from "@ralph/shared";
import { SUPABASE_ADMIN } from "@/modules/supabase/supabase.module";
import { Report } from "@/modules/reports/domain/report.entity";
import { ReportRepository } from "@/modules/reports/domain/report.repository";
import { ReportRow } from "./types";
@Injectable()
export class SupabaseReportRepository implements ReportRepository {
    constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient) { }
    async save(report: Report): Promise<void> {
        const snapshot = report.toSnapshot();

        // 1. Save request to requests table
        if (snapshot.request && snapshot.requestId) {
            const { error: reqError } = await this.supabase
                .from("requests")
                .upsert({
                    id: snapshot.requestId,
                    user_id: snapshot.userId,
                    payload: snapshot.request,
                    created_at: snapshot.createdAt,
                });
            if (reqError) {
                throw reqError;
            }
        }

        // 2. Save listing to listings table
        if (snapshot.listing && snapshot.listingId) {
            const { error: listError } = await this.supabase
                .from("listings")
                .upsert({
                    id: snapshot.listingId,
                    url: snapshot.listing.listingUrl || "",
                    payload: snapshot.listing,
                    raw_html: snapshot.listing.rawHtml || null,
                    created_at: snapshot.createdAt,
                });
            if (listError) {
                throw listError;
            }
        }

        // 3. Save verdict to verdicts table
        if (snapshot.result && snapshot.verdictId) {
            const { error: verdError } = await this.supabase
                .from("verdicts")
                .upsert({
                    id: snapshot.verdictId,
                    payload: snapshot.result,
                    created_at: snapshot.createdAt,
                });
            if (verdError) {
                throw verdError;
            }
        }

        // 4. Save report row
        const row = this.toRow(snapshot);
        const { error } = await this.supabase.from("reports").upsert(row);
        if (error) {
            throw error;
        }
    }
    async findById(id: string): Promise<Report | null> {
        const { data, error } = await this.supabase
            .from("reports")
            .select("*")
            .eq("id", id)
            .maybeSingle<ReportRow>();
        if (error) {
            throw error;
        }
        if (!data) return null;

        // Fetch request
        let requestPayload: any;
        if (data.request_id) {
            const { data: reqData, error: reqError } = await this.supabase
                .from("requests")
                .select("payload")
                .eq("id", data.request_id)
                .maybeSingle();
            if (reqError) {
                throw reqError;
            }
            requestPayload = reqData?.payload;
        }

        // Fetch listing
        let listingPayload: any;
        if (data.listing_id) {
            const { data: listData, error: listError } = await this.supabase
                .from("listings")
                .select("payload")
                .eq("id", data.listing_id)
                .maybeSingle();
            if (listError) {
                throw listError;
            }
            listingPayload = listData?.payload;
        }

        // Fetch verdict
        let verdictPayload: any;
        if (data.verdict_id) {
            const { data: verdData, error: verdError } = await this.supabase
                .from("verdicts")
                .select("payload")
                .eq("id", data.verdict_id)
                .maybeSingle();
            if (verdError) {
                throw verdError;
            }
            verdictPayload = verdData?.payload;
        }

        return Report.fromSnapshot(this.fromRow(data, requestPayload, listingPayload, verdictPayload));
    }
    async findByUserId(userId: string): Promise<Report[]> {
        const { data, error } = await this.supabase
            .from("reports")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .returns<ReportRow[]>();
        if (error) {
            throw error;
        }
        if (!data || data.length === 0) return [];

        // 1. Batch fetch requests
        const requestIds = data.map((row) => row.request_id).filter(Boolean);
        let reqMap = new Map<string, any>();
        if (requestIds.length > 0) {
            const { data: reqsData, error: reqsError } = await this.supabase
                .from("requests")
                .select("id, payload")
                .in("id", requestIds);
            if (reqsError) {
                throw reqsError;
            }
            reqMap = new Map<string, any>((reqsData ?? []).map((r) => [r.id, r.payload]));
        }

        // 2. Batch fetch listings
        const listingIds = data.map((row) => row.listing_id).filter(Boolean);
        let listMap = new Map<string, any>();
        if (listingIds.length > 0) {
            const { data: listsData, error: listsError } = await this.supabase
                .from("listings")
                .select("id, payload")
                .in("id", listingIds);
            if (listsError) {
                throw listsError;
            }
            listMap = new Map<string, any>((listsData ?? []).map((l) => [l.id, l.payload]));
        }

        // 3. Batch fetch verdicts
        const verdictIds = data.map((row) => row.verdict_id).filter(Boolean);
        let verdMap = new Map<string, any>();
        if (verdictIds.length > 0) {
            const { data: verdsData, error: verdsError } = await this.supabase
                .from("verdicts")
                .select("id, payload")
                .in("id", verdictIds);
            if (verdsError) {
                throw verdsError;
            }
            verdMap = new Map<string, any>((verdsData ?? []).map((v) => [v.id, v.payload]));
        }

        return data.map((row) =>
            Report.fromSnapshot(
                this.fromRow(
                    row,
                    reqMap.get(row.request_id),
                    row.listing_id ? listMap.get(row.listing_id) : undefined,
                    row.verdict_id ? verdMap.get(row.verdict_id) : undefined
                )
            )
        );
    }
    async delete(id: string): Promise<void> {
        const { error } = await this.supabase.from("reports").delete().eq("id", id);
        if (error) {
            throw error;
        }
    }
    private toRow(snapshot: ReportSnapshot): ReportRow {
        return {
            id: snapshot.id,
            user_id: snapshot.userId,
            type: snapshot.type,
            status: snapshot.status,
            request_id: snapshot.requestId,
            listing_id: snapshot.listingId ?? null,
            verdict_id: snapshot.verdictId ?? null,
            request: null,
            listing: null,
            profile: snapshot.profile ?? null,
            result: null,
            created_at: snapshot.createdAt,
            updated_at: snapshot.updatedAt,
        };
    }
    private fromRow(row: ReportRow, requestPayload?: any, listingPayload?: any, verdictPayload?: any): ReportSnapshot {
        return reportSnapshotSchema.parse({
            id: row.id,
            userId: row.user_id,
            type: row.type,
            status: row.status,
            requestId: row.request_id || row.id,
            listingId: row.listing_id ?? undefined,
            verdictId: row.verdict_id ?? undefined,
            request: requestPayload ?? row.request ?? undefined,
            listing: listingPayload ?? row.listing ?? undefined,
            profile: row.profile ?? undefined,
            result: verdictPayload ?? row.result ?? undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }
}
