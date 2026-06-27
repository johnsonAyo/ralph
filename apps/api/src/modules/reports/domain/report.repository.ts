import { Report } from "./report.entity";
export interface ReportRepository {
    save(report: Report): Promise<void>;
    findById(id: string): Promise<Report | null>;
    findByUserId(userId: string): Promise<Report[]>;
}
