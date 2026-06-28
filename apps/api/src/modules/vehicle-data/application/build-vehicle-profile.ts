import {
  MotTest,
  VehicleProfile,
  vehicleProfileSchema,
  VehicleTrack,
} from "@ralph/shared";
import { VehicleProfilePatch } from "../domain/vehicle-data-provider.interface";

const KM_TO_MI = 0.621371;

function fillInto<T extends Record<string, unknown>>(target: T, patch?: Partial<T>): void {
  if (!patch) return;
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === null) continue;
    if (target[key as keyof T] === undefined || target[key as keyof T] === null) {
      target[key as keyof T] = value as T[keyof T];
    }
  }
}

function byCompletedDateDesc(a: MotTest, b: MotTest): number {
  return (b.completedDate ?? "").localeCompare(a.completedDate ?? "");
}

function mileageInMiles(test: MotTest): number | undefined {
  if (test.odometerValue == null) return undefined;
  return (test.odometerUnit ?? "mi").toLowerCase().startsWith("k")
    ? Math.round(test.odometerValue * KM_TO_MI)
    : test.odometerValue;
}

export function deriveSignals(motHistory: MotTest[]): VehicleProfile["derived"] {
  const tests = [...motHistory].sort(byCompletedDateDesc);
  if (tests.length === 0) {
    return { recurringAdvisories: [] };
  }

  const chrono = [...tests].reverse();
  const readings = chrono
    .map((t) => ({ date: t.completedDate, miles: mileageInMiles(t) }))
    .filter((r): r is { date: string | undefined; miles: number } => r.miles != null);

  let mileageAnomaly = false;
  for (let i = 1; i < readings.length; i++) {
    if (readings[i].miles < readings[i - 1].miles) {
      mileageAnomaly = true;
      break;
    }
  }

  const latestMileage = readings.length ? readings[readings.length - 1].miles : undefined;

  let estimatedAnnualMileage: number | undefined;
  if (readings.length >= 2) {
    const first = readings[0];
    const last = readings[readings.length - 1];
    const years =
      (new Date(last.date ?? "").getTime() - new Date(first.date ?? "").getTime()) /
      (365.25 * 24 * 3600 * 1000);
    if (years > 0.5) {
      estimatedAnnualMileage = Math.round((last.miles - first.miles) / years);
    }
  }

  const counts = new Map<string, number>();
  for (const test of tests) {
    const seen = new Set<string>();
    for (const defect of test.defects ?? []) {
      if (defect.type !== "ADVISORY") continue;
      const key = defect.text.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const recurringAdvisories = [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([text]) => text);

  const completed = tests.filter((t) => t.testResult);
  const passes = completed.filter((t) => (t.testResult ?? "").toUpperCase().startsWith("PASS"));
  const motPassRate = completed.length ? passes.length / completed.length : undefined;

  return {
    latestMileage,
    estimatedAnnualMileage,
    mileageAnomaly: readings.length ? mileageAnomaly : undefined,
    recurringAdvisories,
    motPassRate,
  };
}

export function buildVehicleProfile(input: {
  registration: string;
  track?: VehicleTrack;
  patches: Array<{ source: string; patch: VehicleProfilePatch }>;
}): VehicleProfile {
  const identity: Record<string, unknown> = {};
  const emissions: Record<string, unknown> = {};
  const status: Record<string, unknown> = {};
  let motHistory: MotTest[] = [];
  const sources: string[] = [];

  for (const { source, patch } of input.patches) {
    fillInto(identity, patch.identity);
    fillInto(emissions, patch.emissions);
    fillInto(status, patch.status);
    if (patch.motHistory && patch.motHistory.length > 0 && motHistory.length === 0) {
      motHistory = patch.motHistory;
    }
    sources.push(source);
  }

  return vehicleProfileSchema.parse({
    registration: input.registration.replace(/\s+/g, "").toUpperCase(),
    track: input.track ?? VehicleTrack.RoadCar,
    identity,
    emissions,
    status,
    motHistory,
    derived: deriveSignals(motHistory),
    provenance: { sources },
  });
}
