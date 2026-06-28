import assert from "node:assert/strict";
import test from "node:test";
import { VehicleTrack } from "@ralph/shared";
import {
  buildVehicleProfile,
  deriveSignals,
} from "@/modules/vehicle-data/application/build-vehicle-profile";

test("deriveSignals flags a mileage drop as a clocking anomaly", () => {
  const d = deriveSignals([
    { completedDate: "2021-01-01", testResult: "PASSED", odometerValue: 40000, odometerUnit: "mi", defects: [] },
    { completedDate: "2022-01-01", testResult: "PASSED", odometerValue: 55000, odometerUnit: "mi", defects: [] },
    { completedDate: "2023-01-01", testResult: "PASSED", odometerValue: 30000, odometerUnit: "mi", defects: [] }, // dropped!
  ]);
  assert.equal(d.mileageAnomaly, true);
  assert.equal(d.latestMileage, 30000);
});

test("deriveSignals: steady mileage has no anomaly and estimates annual miles", () => {
  const d = deriveSignals([
    { completedDate: "2020-01-01", testResult: "PASSED", odometerValue: 20000, odometerUnit: "mi", defects: [] },
    { completedDate: "2024-01-01", testResult: "PASSED", odometerValue: 60000, odometerUnit: "mi", defects: [] },
  ]);
  assert.equal(d.mileageAnomaly, false);
  assert.equal(d.latestMileage, 60000);
  // ~40000 miles over ~4 years → ~10000/yr
  assert.ok(d.estimatedAnnualMileage! > 9000 && d.estimatedAnnualMileage! < 11000);
});

test("deriveSignals surfaces advisories repeated across tests", () => {
  const d = deriveSignals([
    { completedDate: "2022-01-01", testResult: "PASSED", odometerValue: 10, odometerUnit: "mi", defects: [{ text: "Nearside front tyre worn", type: "ADVISORY" }] },
    { completedDate: "2023-01-01", testResult: "PASSED", odometerValue: 20, odometerUnit: "mi", defects: [{ text: "nearside front tyre worn", type: "ADVISORY" }] },
    { completedDate: "2024-01-01", testResult: "FAILED", odometerValue: 30, odometerUnit: "mi", defects: [{ text: "Brake disc worn", type: "MAJOR" }] },
  ]);
  assert.deepEqual(d.recurringAdvisories, ["nearside front tyre worn"]);
  assert.ok(Math.abs((d.motPassRate ?? 0) - 2 / 3) < 1e-9);
});

test("deriveSignals converts km readings to miles", () => {
  const d = deriveSignals([
    { completedDate: "2023-01-01", testResult: "PASSED", odometerValue: 100000, odometerUnit: "km", defects: [] },
  ]);
  // 100000 km ≈ 62137 mi
  assert.ok(d.latestMileage! > 62000 && d.latestMileage! < 62300);
});

test("buildVehicleProfile merges sources fill-if-empty (DVLA make, MOT model)", () => {
  const profile = buildVehicleProfile({
    registration: "ab19 cde",
    track: VehicleTrack.RoadCar,
    patches: [
      { source: "dvla_ves", patch: { identity: { make: "FORD", colour: "Blue" }, status: { taxStatus: "Taxed" } } },
      { source: "dvsa_mot", patch: { identity: { make: "Ford (ignored)", model: "Fiesta" }, motHistory: [{ completedDate: "2023-01-01", testResult: "PASSED", odometerValue: 48000, odometerUnit: "mi", defects: [] }] } },
    ],
  });
  assert.equal(profile.registration, "AB19CDE"); // normalized
  assert.equal(profile.identity.make, "FORD"); // DVLA wins (first)
  assert.equal(profile.identity.model, "Fiesta"); // MOT fills the gap
  assert.equal(profile.status.taxStatus, "Taxed");
  assert.equal(profile.derived.latestMileage, 48000);
  assert.deepEqual(profile.provenance.sources, ["dvla_ves", "dvsa_mot"]);
});
