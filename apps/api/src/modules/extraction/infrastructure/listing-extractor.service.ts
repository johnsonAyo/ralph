import { Injectable } from "@nestjs/common";
import { AuctionPlatformCode, ListingSnapshot } from "@ralph/shared";
import { detectPlatform } from "@/modules/extraction/application/detect-platform";
import { ListingExtractorPort } from "@/modules/extraction/domain/listing-extractor.port";
import { PlatformListingExtractor } from "@/modules/extraction/domain/interfaces/platform-listing-extractor.interface";
import { CopartListingExtractor } from "@/modules/extraction/infrastructure/copart/copart-listing.extractor";
import { GenericListingExtractor } from "@/modules/extraction/infrastructure/generic/generic-listing.extractor";

@Injectable()
export class ListingExtractorService implements ListingExtractorPort {
    /**
     * Platforms that need bespoke handling. Copart's photo gallery is WAF-gated
     * and requires in-page browser actions, so it keeps a dedicated extractor.
     * Everything else (IAA and all other UK sites) goes through the generic
     * LLM extractor — adding a new site needs no code here.
     */
    private readonly bespokeExtractors: Map<AuctionPlatformCode, PlatformListingExtractor>;

    constructor(
        copartExtractor: CopartListingExtractor,
        private readonly genericExtractor: GenericListingExtractor,
    ) {
        this.bespokeExtractors = new Map<AuctionPlatformCode, PlatformListingExtractor>([
            [copartExtractor.platform, copartExtractor],
        ]);
    }

    async extract(listingUrl: string): Promise<ListingSnapshot> {
        // detectPlatform throws for unsupported (e.g. US) listings.
        const platform = detectPlatform(listingUrl);
        const extractor = this.bespokeExtractors.get(platform) ?? this.genericExtractor;
        return extractor.extract(listingUrl);
    }
}
