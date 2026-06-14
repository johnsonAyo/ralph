import { CopartFieldCode, COPART_CACHED_DETAILS_PATTERN } from "@/modules/extraction/domain/constants/copart.constants";
import { JsonRecord } from "@/modules/extraction/domain/types/json-record.type";
import { isRecord, recordValue, toNumber } from "@/modules/extraction/infrastructure/shared/parsing.utils";


export function extractCachedCopartLotDetails(html: string): JsonRecord | undefined {
  const match = html.match(COPART_CACHED_DETAILS_PATTERN);

  if (!match?.[1]) {
    return undefined;
  }

  try {
    const jsonString = JSON.parse(`"${match[1]}"`) as string;
    const parsed = JSON.parse(jsonString) as unknown;
    return isRecord(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function formatCopartSaleDate(cachedLotDetails?: JsonRecord): string | undefined {
  const saleTimestamp = toNumber(recordValue(cachedLotDetails, CopartFieldCode.AuctionDate));

  if (!saleTimestamp) {
    return undefined;
  }

  return new Date(saleTimestamp).toISOString();
}
