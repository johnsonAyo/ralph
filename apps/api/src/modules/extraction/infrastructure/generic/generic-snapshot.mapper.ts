import { AuctionPlatformCode, ExtractedImage, ListingSnapshot, listingSnapshotSchema, } from "@ralph/shared";
import {
    confidenceFromMissingFields,
    missingRequiredFields,
    uniqueImages,
} from "@/modules/extraction/infrastructure/shared/parsing.utils";
import { GenericExtraction, GENERIC_REQUIRED_FIELDS } from "./generic-extraction.schema";

/** null -> undefined so the listing schema's optionals stay clean. */
function clean<T>(value: T | null | undefined): T | undefined {
    return value ?? undefined;
}

/**
 * Builds vehicle photos from the LLM's selection, but only trusts URLs that
 * actually appeared in the candidate set — guards against the model inventing
 * image URLs that were never on the page.
 */
function buildImages(selected: string[], candidates: string[]): ExtractedImage[] {
    const allowed = new Set(candidates);
    return uniqueImages(
        selected
            .filter((url) => allowed.has(url))
            .map((url, index) => ({ sequence: index + 1, fullUrl: url })),
    );
}

export function buildGenericListingSnapshot(input: {
    platform: AuctionPlatformCode;
    listingUrl: string;
    extraction: GenericExtraction;
    imageCandidates: string[];
}): ListingSnapshot {
    const { extraction } = input;
    const snapshot = {
        platform: input.platform,
        listingUrl: input.listingUrl,
        lotNumber: clean(extraction.lotNumber),
        title: clean(extraction.title),
        year: clean(extraction.year),
        make: clean(extraction.make),
        model: clean(extraction.model),
        mileage: clean(extraction.mileage),
        mileageUnit: clean(extraction.mileageUnit),
        currentBid: clean(extraction.currentBid),
        buyItNowPrice: clean(extraction.buyItNowPrice),
        currency: clean(extraction.currency) ?? "GBP",
        saleDate: clean(extraction.saleDate),
        location: clean(extraction.location),
        category: clean(extraction.category),
        primaryDamage: clean(extraction.primaryDamage),
        secondaryDamage: clean(extraction.secondaryDamage),
        runCondition: clean(extraction.runCondition),
        hasKeys: clean(extraction.hasKeys),
        v5Status: clean(extraction.v5Status),
        estimatedRetailValue: clean(extraction.estimatedRetailValue),
        images: buildImages(extraction.imageUrls, input.imageCandidates),
    };

    const missingFields = missingRequiredFields(snapshot, GENERIC_REQUIRED_FIELDS);
    return listingSnapshotSchema.parse({
        ...snapshot,
        missingFields,
        extractionConfidence: confidenceFromMissingFields(missingFields),
    });
}
