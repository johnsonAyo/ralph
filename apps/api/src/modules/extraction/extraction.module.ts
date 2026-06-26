import { Module } from "@nestjs/common";
import { LISTING_EXTRACTOR } from "@/common/tokens";
import { PlaywrightBrowserFactory } from "./infrastructure/browser/playwright-browser.factory";

import { CopartListingExtractor } from "./infrastructure/copart/copart-listing.extractor";
import { IaaListingExtractor } from "./infrastructure/iaa/iaa-listing.extractor";
import { ListingExtractorService } from "./infrastructure/listing-extractor.service";

@Module({
  controllers: [],
  providers: [
    PlaywrightBrowserFactory,
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
export class ExtractionModule {}
