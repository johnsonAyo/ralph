import { Injectable, Logger } from "@nestjs/common";
import { ReportResult } from "@ralph/shared";
import { AppError } from "@/common/errors/app.error";
import { RalphAnalyserPort } from "../domain/ralph-analyser.port";
import { RalphAnalysisContext } from "../domain/ralph-analysis-context";
@Injectable()
export class FallbackRalphAnalyserService implements RalphAnalyserPort {
    private readonly logger = new Logger(FallbackRalphAnalyserService.name);
    constructor(private readonly primary: RalphAnalyserPort, private readonly secondary: RalphAnalyserPort) { }
    async analyse(input: RalphAnalysisContext): Promise<ReportResult> {
        try {
            return await this.primary.analyse(input);
        }
        catch (primaryError) {
            const primaryMessage = primaryError instanceof Error ? primaryError.message : String(primaryError);
            const primaryCode = primaryError instanceof AppError ? primaryError.code : "UNKNOWN_PRIMARY";
            this.logger.warn(`Primary Ralph analyser failed (${primaryCode}: ${primaryMessage}). Attempting fallback provider.`);
            try {
                return await this.secondary.analyse(input);
            }
            catch (secondaryError) {
                throw secondaryError;
            }
        }
    }
}
