import { ListingSnapshot, VehicleProfile, VehicleVerdictRequest } from "@ralph/shared";

// Unified analysis context: any subset of these data sources may be present.
export interface VehicleVerdictContext {
  request: VehicleVerdictRequest;
  // From a registration lookup (DVLA/MOT). Absent for listing/manual-only checks.
  profile?: VehicleProfile;
  // From a scraped listing. Absent for reg/manual-only checks.
  listing?: ListingSnapshot;
}
