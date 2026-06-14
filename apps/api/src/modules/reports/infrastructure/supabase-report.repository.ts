import { Inject, Injectable } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { ReportSnapshot, reportSnapshotSchema } from "@ralph/shared";
import { SUPABASE_ADMIN } from "@/modules/supabase/supabase.module";
import { Report } from "@/modules/reports/domain/report.entity";
import { ReportRepository } from "@/modules/reports/domain/report.repository";


type ReportRow = {
  id: string;
  user_id: string;
  status: string;
  request: unknown;
  listing: unknown;
  result: unknown;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class SupabaseReportRepository implements ReportRepository {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  async save(report: Report): Promise<void> {
    const snapshot = report.toSnapshot();
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

    return data ? Report.fromSnapshot(this.fromRow(data)) : null;
  }

  private toRow(snapshot: ReportSnapshot): ReportRow {
    return {
      id: snapshot.id,
      user_id: snapshot.userId,
      status: snapshot.status,
      request: snapshot.request,
      listing: snapshot.listing ?? null,
      result: snapshot.result ?? null,
      created_at: snapshot.createdAt,
      updated_at: snapshot.updatedAt,
    };
  }

  private fromRow(row: ReportRow): ReportSnapshot {
    return reportSnapshotSchema.parse({
      id: row.id,
      userId: row.user_id,
      status: row.status,
      request: row.request,
      listing: row.listing ?? undefined,
      result: row.result ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
