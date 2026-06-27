import { Logger } from "@nestjs/common";
import { ExtractedImage } from "@ralph/shared";
import {
    CopartFieldCode,
    COPART_IMAGE_RESPONSE_MARKER,
    COPART_IMG_SUFFIX_THUMB,
    COPART_IMG_SUFFIX_FULL,
    COPART_IMG_SUFFIX_HIRES,
} from "@/modules/extraction/domain/constants/copart.constants";
import { JsonRecord } from "@/modules/extraction/domain/types/json-record.type";
import { isRecord, recordValue, toNumber, toStringValue, } from "@/modules/extraction/infrastructure/shared/parsing.utils";

const imageLogger = new Logger("fetchCopartLotImages");

/**
 * Copart embeds the primary photo as a thumbnail (`tims`, ..._thb.jpg) in the page's
 * cached lot detail. The CDN serves the same photo at full/high-res by swapping the
 * suffix, so one thumbnail URL gives us a usable hero image with no extra request.
 * This is our guaranteed fallback when the gallery API (WAF-locked) can't be reached.
 */
function heroImageFromCachedDetails(cachedLotDetails?: JsonRecord): ExtractedImage[] {
    const thumb = toStringValue(recordValue(cachedLotDetails, CopartFieldCode.ThumbnailImage));
    if (!thumb || !thumb.includes(COPART_IMG_SUFFIX_THUMB)) {
        return [];
    }
    return [{
        sequence: 1,
        thumbnailUrl: thumb,
        fullUrl: thumb.replace(COPART_IMG_SUFFIX_THUMB, COPART_IMG_SUFFIX_FULL),
        highResUrl: thumb.replace(COPART_IMG_SUFFIX_THUMB, COPART_IMG_SUFFIX_HIRES),
    }];
}
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
/** Hidden element id we inject the gallery JSON into via in-page browser actions. */
export const COPART_GALLERY_MARKER_ID = "ralph-imgs";

/**
 * Browser actions (Scrape.do "playWithBrowser") that fetch Copart's WAF-gated gallery
 * endpoint *from inside the rendered page* — so the request carries the page's Incapsula
 * session cookies and succeeds even from a datacenter IP. The JSON is written into a hidden
 * element so it comes back in the returned HTML. This is the only path that reliably gets
 * the full gallery on Fly.
 */
export function buildCopartGalleryActions(lotNumber: string, countryCode = "GB"): unknown[] {
    const path = `/public/data/lotdetails/solr/lotImages/${lotNumber}/${countryCode}`;
    const execute =
        `fetch('${path}',{credentials:'include'})` +
        `.then(function(r){return r.text();})` +
        `.then(function(t){var e=document.createElement('div');e.id='${COPART_GALLERY_MARKER_ID}';e.style.display='none';e.textContent=t;document.body.appendChild(e);})` +
        `.catch(function(){});`;
    return [
        { Action: "Execute", Execute: execute },
        { Action: "WaitForRequestCompletion", UrlPattern: "*lotImages*", Timeout: 15000 },
        { Action: "Wait", Timeout: 3000 },
    ];
}

/** Parse the gallery JSON injected by buildCopartGalleryActions out of the returned HTML text. */
export function parseCopartGalleryJson(injectedText: string | undefined): ExtractedImage[] {
    if (!injectedText || !injectedText.includes(COPART_IMAGE_RESPONSE_MARKER)) {
        return [];
    }
    try {
        return normalizeCopartImagesResponse(JSON.parse(injectedText) as JsonRecord);
    } catch {
        return [];
    }
}

/**
 * Resolves Copart lot photos. The full gallery lives behind Copart's `lotImages` JSON
 * endpoint, which is WAF-gated and only reachable from a clean (residential) IP with the
 * page session — it works in local dev but reliably fails on a datacenter host (Fly), where
 * it 403s/tarpits. So:
 *   1. Try the gallery API natively (7s timeout). When it works → all photos.
 *   2. Otherwise fall back to the `tims` hero thumbnail embedded in the page (always present,
 *      no extra request), upscaled to full-res. One good photo is enough to confirm the car.
 */
export async function fetchCopartLotImages(baseUrl: string, cachedLotDetails?: JsonRecord): Promise<ExtractedImage[]> {
    const lotNumber = toStringValue(recordValue(cachedLotDetails, CopartFieldCode.LotNumber)) ??
        toStringValue(recordValue(cachedLotDetails, CopartFieldCode.LotNumberNumeric));

    if (lotNumber) {
        const countryCode = toStringValue(recordValue(cachedLotDetails, "locCountry"));
        const origin = new URL(baseUrl).origin;
        const paths = countryCode
            ? [
                `${origin}/public/data/lotdetails/solr/lotImages/${lotNumber}/${countryCode}`,
                `${origin}/public/data/lotdetails/solr/lotImages/${lotNumber}`,
            ]
            : [`${origin}/public/data/lotdetails/solr/lotImages/${lotNumber}`];

        for (const path of paths) {
            // Native fetch with a hard 7s timeout — on a datacenter IP Copart tarpits the
            // connection rather than returning a 403, so without this it would hang forever.
            try {
                const res = await fetch(path, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                        "Accept": "application/json",
                    },
                    signal: AbortSignal.timeout(7000),
                });
                if (res.ok) {
                    const text = await res.text();
                    if (text.includes(COPART_IMAGE_RESPONSE_MARKER)) {
                        const images = normalizeCopartImagesResponse(JSON.parse(text) as JsonRecord);
                        if (images.length > 0) {
                            return images;
                        }
                    }
                }
            } catch {
                // Expected on datacenter IPs — fall through to the embedded hero image.
            }
        }
    }

    // Fallback: the embedded hero thumbnail (works everywhere, incl. Fly).
    const hero = heroImageFromCachedDetails(cachedLotDetails);
    if (hero.length > 0) {
        imageLogger.warn(`Gallery API unavailable for lot ${lotNumber ?? "?"} — using embedded hero photo only.`);
        return hero;
    }

    imageLogger.error(`No images found for lot ${lotNumber ?? "?"} (gallery API blocked and no embedded thumbnail).`);
    return [];
}
