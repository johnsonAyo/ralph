export enum IaaLabel {
    Category = "Category",
    Description = "Description",
    DrivetrainDrives = "Drivetrain drives",
    EngineStarts = "Engine starts",
    Keys = "Keys",
    Odometer = "Odometer",
    V5Document = "V5 Document",
    Vehicle = "Vehicle"
}
export enum IaaValue {
    Currency = "GBP",
    MileageUnit = "MI",
    PlatformLocationPrefix = "IAA UK"
}
export const IAA_REQUIRED_FIELDS = [
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
    "images",
] as const;
export const IAA_IMAGE_SELECTOR = "img.preload";
export const IAA_PAGE_TITLE_SUFFIX_PATTERN = /\s+at IAA UK.*$/i;
export const IAA_PRICE_LINE_PATTERN = /^£[\d,]+/;
export const IAA_SALE_DATE_LINE_PATTERN = /^[A-Z][a-z]{2}\s+\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2}/;
export const UK_POSTCODE_LINE_PATTERN = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
