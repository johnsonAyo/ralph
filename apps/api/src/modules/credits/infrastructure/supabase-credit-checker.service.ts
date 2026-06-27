import { Inject, Injectable } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN } from "@/modules/supabase/supabase.module";
import { CreditCheckerPort, CreditReservation } from "@/modules/credits/domain/credit-checker.port";
import { DomainError } from "@/common/errors/app.error";
const CREDIT_DEBIT_AMOUNT = -1;
const CREDIT_EVENT_TYPE = "report_debit";
@Injectable()
export class SupabaseCreditCheckerService implements CreditCheckerPort {
    constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient) { }
    async reserveReportCredit(userId: string, reportId: string): Promise<CreditReservation> {
        const { data: entries, error: balanceError } = await this.supabase
            .from("credits_ledger")
            .select("amount")
            .eq("user_id", userId);
        if (balanceError) {
            throw balanceError;
        }
        const balance = (entries ?? []).reduce((sum, entry) => sum + entry.amount, 0);
        if (balance <= 0) {
            throw new DomainError("Insufficient credits to run a report. Please purchase more credits.", "INSUFFICIENT_CREDITS");
        }
        const { data, error } = await this.supabase
            .from("credits_ledger")
            .insert({
            user_id: userId,
            report_id: reportId,
            event_type: CREDIT_EVENT_TYPE,
            amount: CREDIT_DEBIT_AMOUNT,
            metadata: { source: "report_creation" },
        })
            .select("id")
            .single();
        if (error) {
            throw error;
        }
        return {
            reservationId: data.id as string,
            userId,
            reportId,
        };
    }
}
