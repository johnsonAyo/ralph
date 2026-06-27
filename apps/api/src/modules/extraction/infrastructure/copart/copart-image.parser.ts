import { Logger } from "@nestjs/common";
import { ExtractedImage } from "@ralph/shared";
import { CopartFieldCode, COPART_IMAGE_RESPONSE_MARKER, } from "@/modules/extraction/domain/constants/copart.constants";
import { JsonRecord } from "@/modules/extraction/domain/types/json-record.type";
import { isRecord, recordValue, toNumber, toStringValue, } from "@/modules/extraction/infrastructure/shared/parsing.utils";
import { ScrapeClient } from "../scrape/scrape.client";

const imageLogger = new Logger("fetchCopartLotImages");
export function normalizeCopartImagesResponse(json: JsonRecord): ExtractedImage[] {
    const data = recordValue<JsonRecord>(json, "data");
    const imagesList = recordValue<JsonRecord>(data, "imagesList");
    const imageItems = recordValue<unknown[]>(imagesList, "content") ?? recordValue<unknown[]>(imagesList, "IMAGE");
    if (!Array.isArray(imageItems)) {
        return [];
    }
    const images: ExtractedImage[] = [];
    for (const item of imageItems) {
        if (!isRecord(item)) {
            continue;
        }
        const fullUrl = toStringValue(recordValue(item, "fullUrl"));
        if (!fullUrl) {
            continue;
        }
        images.push({
            fullUrl,
            ...(toNumber(recordValue(item, "imageSeqNumber")) !== undefined
                ? { sequence: toNumber(recordValue(item, "imageSeqNumber")) }
                : {}),
            ...(toStringValue(recordValue(item, "imageLabelCode")) !== undefined
                ? { label: toStringValue(recordValue(item, "imageLabelCode")) }
                : {}),
            ...(toStringValue(recordValue(item, "thumbnailUrl")) !== undefined
                ? { thumbnailUrl: toStringValue(recordValue(item, "thumbnailUrl")) }
                : {}),
            ...(toStringValue(recordValue(item, "highResUrl")) !== undefined
                ? { highResUrl: toStringValue(recordValue(item, "highResUrl")) }
                : {}),
        });
    }
    return images;
}
/**
 * Fetches Copart's high-res image JSON. Copart's image endpoint is not behind the
 * Incapsula JS challenge, so we try a fast/free native `fetch` first. But "no JS
 * challenge" is not "no IP reputation block" — on a datacenter host (e.g. Fly.io) the
 * native call can be 403'd by the same IP filtering that forced us onto ScraperAPI.
 * So if the native call fails or comes back empty, we fall back to Scrape.do's residential
 * proxies for the JSON too (no JS render needed, so it stays cheap) and log when that happens.
 */
export async function fetchCopartLotImages(scrapeClient: ScrapeClient, baseUrl: string, cachedLotDetails?: JsonRecord): Promise<ExtractedImage[]> {
    const lotNumber = toStringValue(recordValue(cachedLotDetails, CopartFieldCode.LotNumber)) ??
        toStringValue(recordValue(cachedLotDetails, CopartFieldCode.LotNumberNumeric));
    if (!lotNumber) {
        imageLogger.warn("No lot number found in cached lot details; returning no images.");
        return [];
    }
    const countryCode = toStringValue(recordValue(cachedLotDetails, "locCountry"));

    // Extract base URL to construct the absolute image API URLs
    const origin = new URL(baseUrl).origin;

    const paths = countryCode
        ? [
            `${origin}/public/data/lotdetails/solr/lotImages/${lotNumber}/${countryCode}`,
            `${origin}/public/data/lotdetails/solr/lotImages/${lotNumber}`,
        ]
        : [`${origin}/public/data/lotdetails/solr/lotImages/${lotNumber}`];

    let responseJson: JsonRecord | null = null;

    for (const path of paths) {
        // 1. Fast path: native fetch (free, works from residential IPs).
        try {
            const res = await fetch(path, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                    "Accept": "application/json",
                },
            });

            if (res.ok) {
                const text = await res.text();
                if (text.includes(COPART_IMAGE_RESPONSE_MARKER)) {
                    responseJson = JSON.parse(text) as JsonRecord;
                    break;
                }
            } else {
                imageLogger.warn(`Native image fetch returned ${res.status} for ${path}; trying ScraperAPI fallback.`);
            }
        } catch (error) {
            imageLogger.warn(`Native image fetch failed for ${path}: ${error}; trying ScraperAPI fallback.`);
        }

        // 2. Fallback: route the JSON through Scrape.do's residential proxies in case the
        //    native call was IP-blocked (datacenter host). No render → still cheap. This is
        //    the production-safe path.
        try {
            const text = await scrapeClient.fetchHtml(path, { residential: true });
            if (text.includes(COPART_IMAGE_RESPONSE_MARKER)) {
                responseJson = JSON.parse(text) as JsonRecord;
                imageLogger.log(`Recovered Copart images via Scrape.do fallback for ${path}.`);
                break;
            }
        } catch (error) {
            imageLogger.warn(`Scrape.do image fallback failed for ${path}: ${error}`);
        }
    }

    if (!responseJson) {
        imageLogger.error(`Failed to fetch Copart images for lot ${lotNumber} (native + ScraperAPI both failed). Report will have no photos.`);
    }

    return responseJson && isRecord(responseJson) ? normalizeCopartImagesResponse(responseJson) : [];
}
