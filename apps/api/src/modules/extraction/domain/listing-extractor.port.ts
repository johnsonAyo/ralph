import { ListingSnapshot } from "@ralph/shared";
export interface ListingExtractorPort {
    extract(listingUrl: string): Promise<ListingSnapshot>;
}
