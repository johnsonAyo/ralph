export enum CopartFieldCode {
    AuctionDate = "ad",
    BuyItNowPrice = "bnp",
    Category = "td",
    Currency = "cuc",
    CurrentBid = "hb",
    EngineStarts = "hegn",
    EstimatedRetailValue = "la",
    HasKeys = "hk",
    Location = "yn",
    LotDescription = "ld",
    LotNumber = "lotNumberStr",
    LotNumberNumeric = "ln",
    Make = "mkn",
    Mileage = "orr",
    Model = "lm",
    PrimaryDamage = "dd",
    RunCondition = "lcd",
    SecondaryDamage = "sdd",
    ThumbnailImage = "tims",
    V5Status = "v5s",
    Year = "lcy"
}
// Copart CDN image URL suffixes: thumbnail / full / high-res of the same photo.
export const COPART_IMG_SUFFIX_THUMB = "_thb";
export const COPART_IMG_SUFFIX_FULL = "_ful";
export const COPART_IMG_SUFFIX_HIRES = "_hrs";
export enum CopartDynamicFieldCode {
    BuyTodayBid = "buyTodayBid",
    CurrentBid = "currentBid"
}
export const COPART_CACHED_DETAILS_PATTERN = /cachedSolrLotDetailsStr:\s*"((?:\\.|[^"\\])*)"/;
export const COPART_IMAGE_RESPONSE_MARKER = "imagesList";
export const COPART_IMAGE_TYPE_STANDARD = "IMG";
export const COPART_REQUIRED_FIELDS = [
    "lotNumber",
    "title",
    "year",
    "make",
    "model",
    "mileage",
    "currentBid",
    "saleDate",
    "location",
    "category",
    "primaryDamage",
    "estimatedRetailValue",
    "images",
] as const;
