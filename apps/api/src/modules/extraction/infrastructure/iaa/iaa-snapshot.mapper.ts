import {
  AuctionPlatformCode,
  ExtractedImage,
  ListingSnapshot,
  listingSnapshotSchema,
} from "@ralph/shared";
import {
  IAA_REQUIRED_FIELDS,
  IaaLabel,
  IaaValue,
  IAA_PRICE_LINE_PATTERN,
  IAA_SALE_DATE_LINE_PATTERN,
  UK_POSTCODE_LINE_PATTERN,
} from "@/modules/extraction/domain/constants/iaa.constants";
import {
  confidenceFromMissingFields,
  firstMatch,
  lastNumericPathSegment,
  missingRequiredFields,
  parseInteger,
  parseMoney,
  stripInfoPrefix,
  uniqueImages,
  valueAfter,
} from "@/modules/extraction/infrastructure/shared/parsing.utils";
import { formatIaaSaleDate, parseIaaVehicleTitle } from "./iaa-title.parser";


export function buildIaaListingSnapshot(input: {
  listingUrl: string;
  title?: string;
  html: string;
  lines: string[];
  images: string[];
}): ListingSnapshot {
  const lotNumber = lastNumericPathSegment(input.listingUrl);
  const title =
    input.title ??
    firstMatch(input.lines, /20\d{2}\s+[A-Z]/) ??
    valueAfter(input.lines, IaaLabel.Vehicle);
  const vehicle = valueAfter(input.lines, IaaLabel.Vehicle) ?? title;
  const parsedVehicle = parseIaaVehicleTitle(vehicle);
  const rawSaleDate = firstMatch(input.lines, IAA_SALE_DATE_LINE_PATTERN);

  const snapshot = {
    platform: AuctionPlatformCode.IaaSynetiqUk,
    listingUrl: input.listingUrl,
    lotNumber,
    title,
    year: parsedVehicle.year,
    make: parsedVehicle.make,
    model: parsedVehicle.model,
    mileage: parseInteger(stripInfoPrefix(valueAfter(input.lines, IaaLabel.Odometer))),
    mileageUnit: IaaValue.MileageUnit,
    currentBid: parseMoney(firstMatch(input.lines, IAA_PRICE_LINE_PATTERN)),
    currency: IaaValue.Currency,
    saleDate: formatIaaSaleDate(rawSaleDate, input.html) ?? rawSaleDate,
    location: findIaaLocation(input.lines),
    category: valueAfter(input.lines, IaaLabel.Category),
    primaryDamage:
      valueAfter(input.lines, IaaLabel.Description) ?? valueAfter(input.lines, IaaLabel.Category),
    runCondition: buildIaaRunCondition(input.lines),
    hasKeys: valueAfter(input.lines, IaaLabel.Keys)?.toLowerCase() === "yes",
    v5Status: valueAfter(input.lines, IaaLabel.V5Document),
    images: buildIaaImages(input.images, lotNumber),
  };

  const missingFields = missingRequiredFields(snapshot, IAA_REQUIRED_FIELDS);

  return listingSnapshotSchema.parse({
    ...snapshot,
    missingFields,
    extractionConfidence: confidenceFromMissingFields(missingFields),
  });
}

function findIaaLocation(lines: string[]): string | undefined {
  const postcode = firstMatch(lines, UK_POSTCODE_LINE_PATTERN);
  const locationLabelIndex = lines.findIndex((line) => line === IaaValue.PlatformLocationPrefix);

  if (locationLabelIndex < 0) {
    return postcode;
  }

  return [lines[locationLabelIndex], lines[locationLabelIndex + 1]].filter(Boolean).join(" ");
}

function buildIaaRunCondition(lines: string[]): string | undefined {
  const engineStarts = stripInfoPrefix(valueAfter(lines, IaaLabel.EngineStarts));
  const drivetrainDrives = stripInfoPrefix(valueAfter(lines, IaaLabel.DrivetrainDrives));
  const parts = [
    engineStarts ? `Engine starts: ${engineStarts}` : null,
    drivetrainDrives ? `Drivetrain drives: ${drivetrainDrives}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join("; ") : undefined;
}

function buildIaaImages(images: string[], lotNumber?: string): ExtractedImage[] {
  return uniqueImages(
    images
      .filter((url) => (lotNumber ? url.includes(`/${lotNumber}/`) : true))
      .map((url, index) => ({
        sequence: index + 1,
        fullUrl: url,
      })),
  );
}
