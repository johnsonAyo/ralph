import { Injectable } from "@nestjs/common";
import { AuctionPlatformCode, ListingSnapshot } from "@ralph/shared";
import { COPART_IMAGE_RESPONSE_MARKER, } from "@/modules/extraction/domain/constants/copart.constants";
import { COPART_POST_LOAD_WAIT_MS, DOM_CONTENT_LOADED_TIMEOUT_MS, NETWORK_IDLE_TIMEOUT_MS, } from "@/modules/extraction/domain/constants/browser.constants";
import { PlatformListingExtractor } from "@/modules/extraction/domain/interfaces/platform-listing-extractor.interface";
import { JsonRecord } from "@/modules/extraction/domain/types/json-record.type";
import { PlaywrightBrowserFactory } from "@/modules/extraction/infrastructure/browser/playwright-browser.factory";
import { uniqueImages } from "@/modules/extraction/infrastructure/shared/parsing.utils";
import { extractCachedCopartLotDetails } from "./copart-html.parser";
import { fetchCopartLotImages, normalizeCopartImagesResponse, } from "./copart-image.parser";
import { buildCopartListingSnapshot } from "./copart-snapshot.mapper";
@Injectable()
export class CopartListingExtractor implements PlatformListingExtractor {
    readonly platform = AuctionPlatformCode.CopartUk;
    constructor(private readonly browserFactory: PlaywrightBrowserFactory) { }
    async extract(listingUrl: string): Promise<ListingSnapshot> {
        const imagesResponses: JsonRecord[] = [];
        const context = await this.browserFactory.createContext();
        const browser = context.browser();
        try {
            const page = await context.newPage();
            page.on("response", async (response) => {
                const responseUrl = response.url();
                const contentType = response.headers()["content-type"] ?? "";
                const looksUseful = responseUrl.includes("lot-images") ||
                    responseUrl.includes("lotImages") ||
                    contentType.includes("application/json");
                if (!looksUseful) {
                    return;
                }
                try {
                    const text = await response.text();
                    if (text.includes(COPART_IMAGE_RESPONSE_MARKER)) {
                        imagesResponses.push(JSON.parse(text) as JsonRecord);
                    }
                }
                catch {
                }
            });
            await page.goto(listingUrl, {
                waitUntil: "domcontentloaded",
                timeout: DOM_CONTENT_LOADED_TIMEOUT_MS,
            });
            const cachedLotDetails = extractCachedCopartLotDetails(await page.content());
            const directImages = await fetchCopartLotImages(page, cachedLotDetails);
            await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS }).catch(() => { });
            await page.waitForTimeout(COPART_POST_LOAD_WAIT_MS);
            const pageData = await page.evaluate(() => {
                const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')]
                    .map((script) => {
                    try {
                        return JSON.parse(script.textContent ?? "{}") as unknown;
                    }
                    catch {
                        return null;
                    }
                })
                    .filter(Boolean);
                const nodes = jsonLd.flatMap((item) => {
                    if (typeof item !== "object" || item === null) {
                        return [];
                    }
                    const graph = (item as {
                        "@graph"?: unknown;
                    })["@graph"];
                    return Array.isArray(graph) ? graph : [item];
                });
                const nodeByType = (type: string) => nodes.find((node) => {
                    return (typeof node === "object" &&
                        node !== null &&
                        (node as {
                            "@type"?: unknown;
                        })["@type"] === type);
                });
                return {
                    vehicle: nodeByType("Vehicle"),
                    product: nodeByType("Product"),
                    lines: (document.body?.innerText ?? "")
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean),
                    finalUrl: window.location.href,
                };
            });
            const images = uniqueImages([
                ...directImages,
                ...imagesResponses.flatMap(normalizeCopartImagesResponse),
            ]);
            return buildCopartListingSnapshot({
                listingUrl: pageData.finalUrl || listingUrl,
                cachedLotDetails,
                vehicle: pageData.vehicle as JsonRecord | undefined,
                product: pageData.product as JsonRecord | undefined,
                lines: pageData.lines,
                images,
            });
        }
        finally {
            await context.close();
            await browser?.close();
        }
    }
}
