import { Injectable, Logger } from "@nestjs/common";
import { AuctionPlatformCode, ListingSnapshot } from "@ralph/shared";
import { PlatformListingExtractor } from "@/modules/extraction/domain/interfaces/platform-listing-extractor.interface";
import { JsonRecord } from "@/modules/extraction/domain/types/json-record.type";
import { ScrapeClient } from "@/modules/extraction/infrastructure/scrape/scrape.client";
import { uniqueImages } from "@/modules/extraction/infrastructure/shared/parsing.utils";
import { extractCachedCopartLotDetails } from "./copart-html.parser";
import {
    buildCopartGalleryActions,
    COPART_GALLERY_MARKER_ID,
    fetchCopartLotImages,
    parseCopartGalleryJson,
} from "./copart-image.parser";
import { buildCopartListingSnapshot } from "./copart-snapshot.mapper";
import * as cheerio from "cheerio";

/** Copart lot URLs are /lot/<number>/<slug>. */
function extractCopartLotNumber(listingUrl: string): string | undefined {
    return listingUrl.match(/\/lot\/(\d+)/)?.[1];
}

@Injectable()
export class CopartListingExtractor implements PlatformListingExtractor {
    readonly platform = AuctionPlatformCode.CopartUk;
    private readonly logger = new Logger(CopartListingExtractor.name);

    constructor(private readonly scrapeClient: ScrapeClient) { }

    async extract(listingUrl: string): Promise<ListingSnapshot> {
        try {
            
            
            
            
            const lotNumber = extractCopartLotNumber(listingUrl);
            const html = await this.scrapeClient.fetchHtml(listingUrl, {
                renderJs: true,
                residential: true,
                ...(lotNumber ? { browserActions: buildCopartGalleryActions(lotNumber) } : {}),
            });
            const $ = cheerio.load(html);

            
            const cachedLotDetails = extractCachedCopartLotDetails(html);

            
            
            let directImages = parseCopartGalleryJson($(`#${COPART_GALLERY_MARKER_ID}`).text());
            if (directImages.length === 0) {
                directImages = await fetchCopartLotImages(listingUrl, cachedLotDetails);
            } else {
                this.logger.log(`Got ${directImages.length} Copart photos via in-page gallery fetch.`);
            }

            // 4. Extract schema.org JSON-LD data
            const jsonLd = $('script[type="application/ld+json"]')
                .map((_, script) => {
                    try {
                        return JSON.parse($(script).html() ?? "{}") as unknown;
                    } catch {
                        return null;
                    }
                })
                .get()
                .filter(Boolean);

            const nodes = jsonLd.flatMap((item) => {
                if (typeof item !== "object" || item === null) {
                    return [];
                }
                const graph = (item as { "@graph"?: unknown })["@graph"];
                return Array.isArray(graph) ? graph : [item];
            });

            const nodeByType = (type: string) => nodes.find((node) => {
                return (
                    typeof node === "object" &&
                    node !== null &&
                    (node as { "@type"?: unknown })["@type"] === type
                );
            });

            // 5. Extract lines from text (similar to innerText)
            const lines = $('body').text()
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);

            // Combine all image sources (since we don't intercept XHRs, we just use directImages)
            const images = uniqueImages([...directImages]);

            const snapshot = buildCopartListingSnapshot({
                listingUrl,
                cachedLotDetails,
                vehicle: nodeByType("Vehicle") as JsonRecord | undefined,
                product: nodeByType("Product") as JsonRecord | undefined,
                lines,
                images,
            });
            snapshot.rawHtml = html;
            return snapshot;
        } catch (error) {
            this.logger.error(`Copart extraction failed for ${listingUrl}: ${error}`);
            throw error;
        }
    }
}

