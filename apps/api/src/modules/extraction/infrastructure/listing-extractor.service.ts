import { Injectable } from "@nestjs/common";
import { AuctionPlatformCode, ListingSnapshot } from "@auction-risk/shared";
import { detectPlatform } from "@/modules/extraction/application/detect-platform";
import { ListingExtractorPort } from "@/modules/extraction/domain/listing-extractor.port";
import { PlatformListingExtractor } from "@/modules/extraction/domain/interfaces/platform-listing-extractor.interface";
import { CopartListingExtractor } from "@/modules/extraction/infrastructure/copart/copart-listing.extractor";
import { IaaListingExtractor } from "@/modules/extraction/infrastructure/iaa/iaa-listing.extractor";
import { ValidationError } from "@/common/errors/app.error";


@Injectable()
export class ListingExtractorService implements ListingExtractorPort {
  private readonly extractors: Map<AuctionPlatformCode, PlatformListingExtractor>;

  constructor(
    copartExtractor: CopartListingExtractor,
    iaaExtractor: IaaListingExtractor,
  ) {
    this.extractors = new Map<AuctionPlatformCode, PlatformListingExtractor>([
      [copartExtractor.platform, copartExtractor],
      [iaaExtractor.platform, iaaExtractor],
    ]);
  }

  async extract(listingUrl: string): Promise<ListingSnapshot> {
    const platform = detectPlatform(listingUrl);
    const extractor = this.extractors.get(platform);

    if (!extractor) {
      throw new ValidationError(`Unsupported auction platform: ${platform}`);
    }

    return extractor.extract(listingUrl);
  }
}

