import {
  AuctionPlatformCode,
  ExtractedImage,
  ListingSnapshot,
  listingSnapshotSchema,
} from "@ralph/shared";
import {
  CopartDynamicFieldCode,
  CopartFieldCode,
  COPART_REQUIRED_FIELDS,
} from "@/modules/extraction/domain/constants/copart.constants";
import { JsonRecord } from "@/modules/extraction/domain/types/json-record.type";
import {
  confidenceFromMissingFields,
  findLineStarting,
  firstMatch,
  lotNumberFromCopartUrl,
  missingRequiredFields,
  parseMoney,
  parseInteger,
  recordValue,
  toNumber,
  toStringValue,
  valueAfter,
} from "@/modules/extraction/infrastructure/shared/parsing.utils";
import { formatCopartSaleDate } from "./copart-html.parser";


export function buildCopartListingSnapshot(input: {
  listingUrl: string;
  cachedLotDetails?: JsonRecord;
  vehicle?: JsonRecord;
  product?: JsonRecord;
  lines: string[];
  images: ExtractedImage[];
}): ListingSnapshot {
  const { cachedLotDetails, vehicle, product, lines } = input;
  const brand = recordValue<JsonRecord>(vehicle, "brand");
  const mileage = recordValue<JsonRecord>(vehicle, "mileageFromOdometer");
  const offers =
    recordValue<JsonRecord>(product, "offers") ?? recordValue<JsonRecord>(vehicle, "offers");
  const dynamicLotDetails = recordValue<JsonRecord>(cachedLotDetails, "dynamicLotDetails");

  const snapshot = {
    platform: AuctionPlatformCode.CopartUk,
    listingUrl: input.listingUrl,
    lotNumber:
      toStringValue(recordValue(cachedLotDetails, CopartFieldCode.LotNumber)) ??
      toStringValue(recordValue(cachedLotDetails, CopartFieldCode.LotNumberNumeric)) ??
      toStringValue(recordValue(product, "sku")) ??
      toStringValue(valueAfter(lines, "Lot number:")) ??
      lotNumberFromCopartUrl(input.listingUrl),
    title:
      toStringValue(recordValue(cachedLotDetails, CopartFieldCode.LotDescription)) ??
      toStringValue(recordValue(vehicle, "name")) ??
      toStringValue(recordValue(product, "name")) ??
      firstMatch(lines, /20\d{2}\s+[A-Z]/),
    year:
      toNumber(recordValue(cachedLotDetails, CopartFieldCode.Year)) ??
      toNumber(recordValue(vehicle, "vehicleModelDate")),
    make:
      toStringValue(recordValue(cachedLotDetails, CopartFieldCode.Make)) ??
      toStringValue(recordValue(brand, "name")),
    model:
      toStringValue(recordValue(cachedLotDetails, CopartFieldCode.Model)) ??
      toStringValue(recordValue(vehicle, "model")),
    mileage:
      toNumber(recordValue(cachedLotDetails, CopartFieldCode.Mileage)) ??
      toNumber(recordValue(mileage, "value")) ??
      parseInteger(valueAfter(lines, "Odometer:")),
    mileageUnit: toStringValue(recordValue(mileage, "unitCode")) ?? "MI",
    currentBid:
      toNumber(recordValue(dynamicLotDetails, CopartDynamicFieldCode.CurrentBid)) ??
      toNumber(recordValue(cachedLotDetails, CopartFieldCode.CurrentBid)) ??
      toNumber(recordValue(offers, "price")) ??
      parseMoney(valueAfter(lines, "Current bid")),
    buyItNowPrice:
      toNumber(recordValue(dynamicLotDetails, CopartDynamicFieldCode.BuyTodayBid)) ??
      toNumber(recordValue(cachedLotDetails, CopartFieldCode.BuyItNowPrice)) ??
      parseMoney(findLineStarting(lines, "Buy It Now")),
    currency: toStringValue(recordValue(cachedLotDetails, CopartFieldCode.Currency)) ?? "GBP",
    saleDate: formatCopartSaleDate(cachedLotDetails) ?? valueAfter(lines, "Sale date:"),
    location:
      toStringValue(recordValue(cachedLotDetails, CopartFieldCode.Location)) ??
      valueAfter(lines, "Sale name:") ??
      valueAfter(lines, "Location:"),
    category:
      toStringValue(recordValue(cachedLotDetails, CopartFieldCode.Category)) ??
      valueAfter(lines, "Category:"),
    primaryDamage:
      toStringValue(recordValue(cachedLotDetails, CopartFieldCode.PrimaryDamage)) ??
      valueAfter(lines, "Primary damage:"),
    secondaryDamage:
      toStringValue(recordValue(cachedLotDetails, CopartFieldCode.SecondaryDamage)) ??
      valueAfter(lines, "Secondary damage:"),
    runCondition:
      toStringValue(recordValue(cachedLotDetails, CopartFieldCode.RunCondition)) ??
      valueAfter(lines, "Run condition:"),
    hasKeys:
      toStringValue(recordValue(cachedLotDetails, CopartFieldCode.HasKeys))?.toLowerCase() ===
        "yes" || lines.some((line) => line.toLowerCase() === "has keys"),
    v5Status:
      toStringValue(recordValue(cachedLotDetails, CopartFieldCode.V5Status)) ??
      valueAfter(lines, "Has key:"),
    estimatedRetailValue:
      toNumber(recordValue(cachedLotDetails, CopartFieldCode.EstimatedRetailValue)) ??
      parseMoney(valueAfter(lines, "Estimated retail value:")),
    images: input.images,
  };

  const missingFields = missingRequiredFields(snapshot, COPART_REQUIRED_FIELDS);

  return listingSnapshotSchema.parse({
    ...snapshot,
    missingFields,
    extractionConfidence: confidenceFromMissingFields(missingFields),
  });
}
