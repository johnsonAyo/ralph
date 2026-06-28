import { AuctionPlatformCode } from "@ralph/shared";
import { ValidationError } from "@/common/errors/app.error";
import { findPlatform } from "./platform-registry";

/**
 * Maps a listing URL to a platform code. Unknown hosts fall through to `Other`
 * (the generic extractor still handles them). US sites are recognised and
 * rejected for now — we are UK-only until they can be validated.
 */
export function detectPlatform(listingUrl: string): AuctionPlatformCode {
    let host: string;
    try {
        host = new URL(listingUrl).hostname;
    } catch {
        throw new ValidationError(`Invalid listing URL: ${listingUrl}`);
    }

    const descriptor = findPlatform(host);
    if (descriptor?.region === "us") {
        throw new ValidationError(
            `${descriptor.label} listings aren't supported yet — Ralph is UK-only for now.`,
        );
    }
    return descriptor?.code ?? AuctionPlatformCode.Other;
}
