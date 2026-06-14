import { ListingSnapshot } from "@auction-risk/shared";

export interface ListingExtractorPort {
  extract(listingUrl: string): Promise<ListingSnapshot>;
}
