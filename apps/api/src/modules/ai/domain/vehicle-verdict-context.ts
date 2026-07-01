import { VehicleProfile, VehicleVerdictRequest } from "@ralph/shared";

export interface VehicleVerdictContext {
  request: VehicleVerdictRequest;
  profile: VehicleProfile;
}
