import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ScrapeOptions, ScrapeProvider } from "../scrape-provider.interface";

/**
 * Scrape.do backend. Free tier: 1,000 successful calls/month, residential proxies +
 * JS render included. Credits are only charged on success, so retrying transient 5xx is free.
 * API: https://api.scrape.do/?token=...&url=...&render=true&super=true&geoCode=GB
 */
@Injectable()
export class ScrapeDoProvider implements ScrapeProvider {
    readonly name = "scrape.do";
    private readonly logger = new Logger(ScrapeDoProvider.name);
    private readonly token: string | undefined;
    private readonly baseUrl = "https://api.scrape.do/";

    constructor(config: ConfigService) {
        this.token = config.get<string>("SCRAPE_DO_TOKEN");
    }

    isConfigured(): boolean {
        return Boolean(this.token);
    }

    async fetchHtml(targetUrl: string, options: ScrapeOptions = {}): Promise<string> {
        if (!this.token) {
            throw new Error("SCRAPE_DO_TOKEN is not set.");
        }
        const { renderJs = false, residential = true, geoCode = "GB", browserActions } = options;
        const hasActions = Array.isArray(browserActions) && browserActions.length > 0;
        // Browser actions require a rendered browser.
        const render = renderJs || hasActions;
        this.logger.debug(`[scrape.do] render=${render} residential=${residential} geo=${geoCode} actions=${hasActions}: ${targetUrl}`);

        const params = new URLSearchParams({
            token: this.token,
            url: targetUrl,
            geoCode,
        });
        if (residential) {
            params.append("super", "true");
        }
        if (render) {
            params.append("render", "true");
        }
        if (hasActions) {
            params.append("playWithBrowser", JSON.stringify(browserActions));
        }

        const url = `${this.baseUrl}?${params.toString()}`;

        // JS rendering legitimately takes time; cap it so a stalled upstream can't hang
        // the whole request (and the user's spinner) indefinitely.
        const timeoutMs = renderJs ? 65000 : 20000;

        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
                if (!response.ok) {
                    const text = await response.text();
                    // Scrape.do charges only successful requests, so retrying a 5xx is free.
                    // 4xx are caller/target errors — don't retry.
                    if (response.status >= 500 && attempt < maxRetries) {
                        this.logger.warn(`[scrape.do] ${response.status} on attempt ${attempt}/${maxRetries}. Retrying...`);
                        await new Promise((res) => setTimeout(res, 2000));
                        continue;
                    }
                    throw new Error(`Scrape.do responded with status ${response.status}: ${text}`);
                }
                return await response.text();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                this.logger.warn(`[scrape.do] network error attempt ${attempt}/${maxRetries}: ${error}. Retrying...`);
                await new Promise((res) => setTimeout(res, 2000));
            }
        }
        throw new Error("Unreachable");
    }
}
