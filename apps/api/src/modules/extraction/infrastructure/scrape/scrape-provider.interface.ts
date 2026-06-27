export interface ScrapeOptions {
    /** Render JS with a headless browser (needed to clear Incapsula/Cloudflare challenges). Most expensive flag. */
    renderJs?: boolean;
    /** Route through residential & mobile proxies. Required for datacenter-blocked sites like Copart. */
    residential?: boolean;
    /** ISO country code for geo-targeting the exit IP. Defaults to GB (UK auction sites). */
    geoCode?: string;
}

/**
 * A single scraping/proxy backend (Scrape.do, ScraperAPI, Firecrawl, …).
 * Implement this to add a new provider, then register it in the SCRAPE_PROVIDERS
 * factory in extraction.module.ts. The orchestrator (ScrapeClient) tries each
 * configured provider in order, so callers never know which one served the request.
 */
export interface ScrapeProvider {
    /** Short human-readable id used in logs, e.g. "scrape.do". */
    readonly name: string;
    /** True when this provider has the credentials it needs (e.g. its token is set). */
    isConfigured(): boolean;
    /** Fetch the raw page/JSON at `targetUrl`, or throw if it cannot. */
    fetchHtml(targetUrl: string, options?: ScrapeOptions): Promise<string>;
}

/** DI token resolving to the ordered, configured-only list of ScrapeProvider instances. */
export const SCRAPE_PROVIDERS = Symbol("SCRAPE_PROVIDERS");
