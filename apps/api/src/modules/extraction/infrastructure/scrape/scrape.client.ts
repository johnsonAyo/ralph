import { Inject, Injectable, Logger } from "@nestjs/common";
import { ScrapeOptions, ScrapeProvider, SCRAPE_PROVIDERS } from "./scrape-provider.interface";

/**
 * Provider-agnostic entry point used by every extractor. Holds an ordered list of
 * scrape providers and tries each in turn until one succeeds — so adding resilience
 * (or a new free tier) later is just appending a provider to the SCRAPE_PROVIDERS
 * factory. Today the chain is [Scrape.do].
 */
@Injectable()
export class ScrapeClient {
    private readonly logger = new Logger(ScrapeClient.name);

    constructor(
        @Inject(SCRAPE_PROVIDERS) private readonly providers: ScrapeProvider[],
    ) {
        if (this.providers.length === 0) {
            this.logger.warn("No scrape providers configured — listing extraction will fail. Set SCRAPE_DO_TOKEN.");
        } else {
            this.logger.log(`Scrape providers (in order): ${this.providers.map((p) => p.name).join(" → ")}`);
        }
    }

    async fetchHtml(targetUrl: string, options: ScrapeOptions = {}): Promise<string> {
        if (this.providers.length === 0) {
            throw new Error("No scrape providers configured. Set SCRAPE_DO_TOKEN (or another provider's token).");
        }

        let lastError: unknown;
        for (const provider of this.providers) {
            try {
                const html = await provider.fetchHtml(targetUrl, options);
                if (provider !== this.providers[0]) {
                    this.logger.log(`Recovered via fallback provider "${provider.name}" for ${targetUrl}.`);
                }
                return html;
            } catch (error) {
                lastError = error;
                this.logger.warn(`Provider "${provider.name}" failed for ${targetUrl}: ${error}. Trying next provider...`);
            }
        }

        throw new Error(`All ${this.providers.length} scrape provider(s) failed for ${targetUrl}. Last error: ${lastError}`);
    }
}
