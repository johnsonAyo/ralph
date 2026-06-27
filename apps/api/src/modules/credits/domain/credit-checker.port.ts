export type CreditReservation = {
    reservationId: string;
    userId: string;
    reportId: string;
};
export interface CreditCheckerPort {
    reserveReportCredit(userId: string, reportId: string): Promise<CreditReservation>;
}
