import { ReportResult } from "@ralph/shared";
import { RalphAnalysisContext } from "./ralph-analysis-context";
export interface RalphAnalyserPort {
    analyse(input: RalphAnalysisContext): Promise<ReportResult>;
}
