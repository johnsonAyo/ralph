import { MotTest, VehicleEmissions, VehicleIdentity, VehicleStatus } from "@ralph/shared";

export interface VehicleProfilePatch {
  identity?: Partial<VehicleIdentity>;
  emissions?: Partial<VehicleEmissions>;
  status?: Partial<VehicleStatus>;
  motHistory?: MotTest[];
}

export interface VehicleDataProvider {
  readonly name: string;
  isConfigured(): boolean;
  fetch(registration: string): Promise<VehicleProfilePatch | null>;
}

export const VEHICLE_DATA_PROVIDERS = Symbol("VEHICLE_DATA_PROVIDERS");
