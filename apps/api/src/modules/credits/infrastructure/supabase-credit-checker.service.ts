import { Injectable } from "@nestjs/common";
import { CreditCheckerPort, CreditReservation } from "@/modules/credits/domain/credit-checker.port";


@Injectable()
export class SupabaseCreditCheckerService implements CreditCheckerPort {
  async reserveReportCredit(userId: string, reportId: string): Promise<CreditReservation> {
    // TODO: Replace with a Supabase RPC transaction:
    // - verify active subscription or available paid/free credit
    // - insert credits_ledger row
    // - return reservation id
    return {
      reservationId: `pending-${reportId}`,
      userId,
      reportId,
    };
  }
}
