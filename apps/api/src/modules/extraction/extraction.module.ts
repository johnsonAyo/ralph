import { Module } from "@nestjs/common";
import { LISTING_EXTRACTOR } from "@/common/tokens";
import { ScrapeClient } from "./infrastructure/scrape/scrape.client";
import { ScrapeProvider, SCRAPE_PROVIDERS } from "./infrastructure/scrape/scrape-provider.interface";
import { ScrapeDoProvider } from "./infrastructure/scrape/providers/scrape-do.provider";
import { CopartListingExtractor } from "./infrastructure/copart/copart-listing.extractor";
import { IaaListingExtractor } from "./infrastructure/iaa/iaa-listing.extractor";
import { ListingExtractorService } from "./infrastructure/listing-extractor.service";

@Module({
    controllers: [],
    providers: [
        ScrapeDoProvider,
        {
            // The chain, in priority order. Only configured providers (token set) are
            // included. To add a provider: implement ScrapeProvider, register the class
            // above, inject it here, and append it to the returned array.
            provide: SCRAPE_PROVIDERS,
            inject: [ScrapeDoProvider],
            useFactory: (scrapeDo: ScrapeDoProvider): ScrapeProvider[] => {
                return [scrapeDo].filter((provider) => provider.isConfigured());
            },
        },
        ScrapeClient,
        CopartListingExtractor,
        IaaListingExtractor,
        ListingExtractorService,
        {
            provide: LISTING_EXTRACTOR,
            useExisting: ListingExtractorService,
        },
    ],
    exports: [LISTING_EXTRACTOR],
})
export class ExtractionModule {
}
