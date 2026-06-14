import { ExtractedImage } from "@ralph/shared";
import { Page } from "playwright";
import {
  CopartFieldCode,
  COPART_IMAGE_RESPONSE_MARKER,
} from "@/modules/extraction/domain/constants/copart.constants";
import { JsonRecord } from "@/modules/extraction/domain/types/json-record.type";
import {
  isRecord,
  recordValue,
  toNumber,
  toStringValue,
} from "@/modules/extraction/infrastructure/shared/parsing.utils";


export function normalizeCopartImagesResponse(json: JsonRecord): ExtractedImage[] {
  const data = recordValue<JsonRecord>(json, "data");
  const imagesList = recordValue<JsonRecord>(data, "imagesList");
  const imageItems =
    recordValue<unknown[]>(imagesList, "content") ?? recordValue<unknown[]>(imagesList, "IMAGE");

  if (!Array.isArray(imageItems)) {
    return [];
  }

  const images: ExtractedImage[] = [];

  for (const item of imageItems) {
    if (!isRecord(item)) {
      continue;
    }

    const fullUrl = toStringValue(recordValue(item, "fullUrl"));

    if (!fullUrl) {
      continue;
    }

    images.push({
      fullUrl,
      ...(toNumber(recordValue(item, "imageSeqNumber")) !== undefined
        ? { sequence: toNumber(recordValue(item, "imageSeqNumber")) }
        : {}),
      ...(toStringValue(recordValue(item, "imageLabelCode")) !== undefined
        ? { label: toStringValue(recordValue(item, "imageLabelCode")) }
        : {}),
      ...(toStringValue(recordValue(item, "thumbnailUrl")) !== undefined
        ? { thumbnailUrl: toStringValue(recordValue(item, "thumbnailUrl")) }
        : {}),
      ...(toStringValue(recordValue(item, "highResUrl")) !== undefined
        ? { highResUrl: toStringValue(recordValue(item, "highResUrl")) }
        : {}),
    });
  }

  return images;
}

export async function fetchCopartLotImages(
  page: Page,
  cachedLotDetails?: JsonRecord,
): Promise<ExtractedImage[]> {
  const lotNumber =
    toStringValue(recordValue(cachedLotDetails, CopartFieldCode.LotNumber)) ??
    toStringValue(recordValue(cachedLotDetails, CopartFieldCode.LotNumberNumeric));

  if (!lotNumber) {
    return [];
  }

  const countryCode = toStringValue(recordValue(cachedLotDetails, "locCountry"));

  const response = await page.evaluate(
    async ({ lotNumber: evaluatedLotNumber, countryCode: evaluatedCountryCode, marker }) => {
      const paths = evaluatedCountryCode
        ? [
            `/public/data/lotdetails/solr/lotImages/${evaluatedLotNumber}/${evaluatedCountryCode}`,
            `/public/data/lotdetails/solr/lotImages/${evaluatedLotNumber}`,
          ]
        : [`/public/data/lotdetails/solr/lotImages/${evaluatedLotNumber}`];

      for (const path of paths) {
        const res = await fetch(path, { credentials: "include" });

        if (!res.ok) {
          continue;
        }

        const text = await res.text();

        if (text.includes(marker)) {
          return JSON.parse(text);
        }
      }

      return null;
    },
    { lotNumber, countryCode, marker: COPART_IMAGE_RESPONSE_MARKER },
  );

  return isRecord(response) ? normalizeCopartImagesResponse(response) : [];
}
