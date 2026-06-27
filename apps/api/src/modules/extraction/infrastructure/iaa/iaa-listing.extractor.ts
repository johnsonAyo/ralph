import { Injectable, Logger } from "@nestjs/common";
import { AuctionPlatformCode, ListingSnapshot } from "@ralph/shared";
import { IAA_IMAGE_SELECTOR, IAA_PAGE_TITLE_SUFFIX_PATTERN, } from "@/modules/extraction/domain/constants/iaa.constants";
import { PlatformListingExtractor } from "@/modules/extraction/domain/interfaces/platform-listing-extractor.interface";
import { ScrapeClient } from "@/modules/extraction/infrastructure/scrape/scrape.client";
import { buildIaaListingSnapshot } from "./iaa-snapshot.mapper";
import * as cheerio from "cheerio";

@Injectable()
export class IaaListingExtractor implements PlatformListingExtractor {
    readonly platform = AuctionPlatformCode.IaaSynetiqUk;
    private readonly logger = new Logger(IaaListingExtractor.name);

    constructor(private readonly scrapeClient: ScrapeClient) { }

    async extract(listingUrl: string): Promise<ListingSnapshot> {
        try {
            const html = await this.scrapeClient.fetchHtml(listingUrl, { renderJs: true, residential: true });
            const $ = cheerio.load(html);

            const lines = $('body').text()
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);

            const rawTitle = $("h1").first().text().trim() || $("title").text().trim();
            const title = rawTitle.replace(IAA_PAGE_TITLE_SUFFIX_PATTERN, "").trim();

            const images = $(IAA_IMAGE_SELECTOR)
                .map((_, image) => $(image).attr("src"))
                .get()
                .filter((src): src is string => Boolean(src))
                .map((src) => {
                    try {
                        return new URL(src, listingUrl).href;
                    } catch {
                        return src; 
                    }
                });

            return buildIaaListingSnapshot({
                listingUrl,
                title,
                html,
                lines,
                images,
            });
        } catch (error) {
            this.logger.error(`IAA extraction failed for ${listingUrl}: ${error}`);
            throw error;
        }
    }
}
