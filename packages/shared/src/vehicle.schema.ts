import { z } from "zod";

export enum VehicleTrack {
  RoadCar = "road_car",
  Salvage = "salvage",
}

export enum VehicleInputMethod {
  Registration = "registration",
  Listing = "listing",
  Manual = "manual",
}

export const vehicleTrackSchema = z.enum(VehicleTrack);
export const vehicleInputMethodSchema = z.enum(VehicleInputMethod);

export const motDefectTypeSchema = z.enum([
  "ADVISORY",
  "MINOR",
  "MAJOR",
  "DANGEROUS",
  "FAIL",
  "USER_ENTERED",
]);

export const motDefectSchema = z.object({
  text: z.string(),
  type: motDefectTypeSchema.optional(),
  dangerous: z.boolean().optional(),
});

export const motTestSchema = z.object({
  completedDate: z.string().optional(),
  testResult: z.string().optional(),
  expiryDate: z.string().optional(),
  odometerValue: z.number().int().nonnegative().optional(),
  odometerUnit: z.string().optional(),
  odometerResultType: z.string().optional(),
  motTestNumber: z.string().optional(),
  defects: z.array(motDefectSchema).default([]),
});

export const vehicleIdentitySchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  variant: z.string().optional(),
  yearOfManufacture: z.number().int().optional(),
  colour: z.string().optional(),
  fuelType: z.string().optional(),
  engineCapacityCc: z.number().int().nonnegative().optional(),
  transmission: z.string().optional(),
  bodyType: z.string().optional(),
  wheelplan: z.string().optional(),
  typeApproval: z.string().optional(),
});

export const vehicleEmissionsSchema = z.object({
  co2gPerKm: z.number().nonnegative().optional(),
  euroStatus: z.string().optional(),
  fuelEconomyCombinedMpg: z.number().nonnegative().optional(),
  ulezCompliant: z.boolean().optional(),
  estimatedAnnualTaxGbp: z.number().nonnegative().optional(),
});

export const vehicleStatusSchema = z.object({
  taxStatus: z.string().optional(),
  taxDueDate: z.string().optional(),
  motStatus: z.string().optional(),
  motExpiryDate: z.string().optional(),
  dateFirstRegistered: z.string().optional(),
  dateOfLastV5cIssued: z.string().optional(),
  markedForExport: z.boolean().optional(),
});

export const vehicleDerivedSchema = z.object({
  latestMileage: z.number().int().nonnegative().optional(),
  estimatedAnnualMileage: z.number().nonnegative().optional(),
  mileageAnomaly: z.boolean().optional(),
  recurringAdvisories: z.array(z.string()).default([]),
  motPassRate: z.number().min(0).max(1).optional(),
});

export const vehicleProvenanceSchema = z.object({
  sources: z.array(z.string()).default([]),
});

export const vehicleProfileSchema = z.object({
  registration: z.string().optional(),
  track: vehicleTrackSchema.default(VehicleTrack.RoadCar),
  identity: vehicleIdentitySchema.default({}),
  emissions: vehicleEmissionsSchema.default({}),
  status: vehicleStatusSchema.default({}),
  motHistory: z.array(motTestSchema).default([]),
  derived: vehicleDerivedSchema.default({ recurringAdvisories: [] }),
  provenance: vehicleProvenanceSchema.default({ sources: [] }),
});

export const vehicleLookupRequestSchema = z.object({
  registration: z.string().min(2).max(10),
});

export type VehicleTrackCode = z.infer<typeof vehicleTrackSchema>;
export type VehicleInputMethodCode = z.infer<typeof vehicleInputMethodSchema>;
export type MotDefect = z.infer<typeof motDefectSchema>;
export type MotTest = z.infer<typeof motTestSchema>;
export type VehicleIdentity = z.infer<typeof vehicleIdentitySchema>;
export type VehicleEmissions = z.infer<typeof vehicleEmissionsSchema>;
export type VehicleStatus = z.infer<typeof vehicleStatusSchema>;
export type VehicleDerived = z.infer<typeof vehicleDerivedSchema>;
export type VehicleProfile = z.infer<typeof vehicleProfileSchema>;
export type VehicleLookupRequest = z.infer<typeof vehicleLookupRequestSchema>;
