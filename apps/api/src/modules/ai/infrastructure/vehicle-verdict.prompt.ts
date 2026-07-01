import { z } from "zod";
import { vehicleVerdictResultSchema } from "@ralph/shared";
import { VehicleVerdictContext } from "../domain/vehicle-verdict-context";

const VEHICLE_VERDICT_INSTRUCTIONS = [
  "You are Ralph, an independent UK used-car buying adviser.",
  "You are given a vehicle's DVLA/MOT data and the buyer's budget.",
  "Your job: advise whether this car is a sensible buy for THIS buyer's budget.",
  "You are an adviser, not a command-giver. State the conditions and a measured verdict. Never say 'do not buy' or 'buy'. Use framing like 'looks like a sound buy if…', 'worth considering below…', 'worth checking…'.",
  "Lead every finding with what it MEANS for the buyer in plain English; put the raw data as the evidence underneath. Do not dump values like a history-check site.",
  "Use ONLY the provided data. The MOT history, identity, tax/MOT status and derived signals are what you have. You do NOT have finance, write-off, stolen, or keeper data — do not claim anything about them; list them under couldNotVerify if relevant.",
  "Connect signals across the MOT history: recurring advisories suggest deferred maintenance the buyer would inherit; a mileage drop suggests possible clocking; a low pass rate suggests budget for repairs.",
  "If askingPrice is provided, judge value and budget fit against it. If not, estimate a typical UK market price range for this make/model/year/mileage from your own knowledge and clearly state in valueEstimate.basis that it is an estimate.",
  "Budget fit: compare the likely all-in cost (price + near-term repairs implied by the MOT advisories) against the buyer's totalBudget. Set budgetFit.rating to comfortable, tight, over, or unknown.",
  "Near-term running cost: estimate a repair allowance for the next 12 months from the advisories, as a range. It is an allowance, not a quote.",
  "Pick verdict from: sound_buy (fits the budget and nothing major stands out), consider_with_caution (workable but with real things to check), budget_stretch (likely over or right at the edge of the budget once costs are added), insufficient_data (too little to say).",
  "Keep it concise, calm, and plain. The buying decision rests with the buyer.",
  // Hard output contract — required because Ollama Cloud does NOT enforce the
  // json_schema/format constraint, so the model must be told to emit JSON only.
  "CRITICAL OUTPUT RULE: respond with ONE minified JSON object and nothing else — no markdown, no code fences, no commentary before or after. It must match the schema given in the user message exactly, using those field names and only the allowed enum values.",
].join(" ");

export interface SharedVehicleVerdictContext {
  instructions: string;
  userPayload: string;
  jsonSchema: Record<string, unknown>;
}

export function buildVehicleVerdictContext(
  context: VehicleVerdictContext,
): SharedVehicleVerdictContext {
  const jsonSchema = z.toJSONSchema(vehicleVerdictResultSchema) as Record<string, unknown>;
  const { request, profile } = context;

  const data = JSON.stringify(
    {
      buyer: {
        totalBudget: request.totalBudget,
        askingPrice: request.askingPrice ?? null,
      },
      vehicle: {
        registration: profile.registration,
        identity: profile.identity,
        status: profile.status,
        emissions: profile.emissions,
        derived: profile.derived,
        motHistory: profile.motHistory.map((test) => ({
          completedDate: test.completedDate,
          testResult: test.testResult,
          odometerValue: test.odometerValue,
          odometerUnit: test.odometerUnit,
          defects: test.defects.map((d) => ({ text: d.text, type: d.type })),
        })),
        sources: profile.provenance.sources,
      },
    },
    null,
    2,
  );

  // Embed the schema in the prompt so models that ignore the format constraint
  // (e.g. Ollama Cloud) still get the exact field names and allowed enum values.
  const userPayload = [
    "DATA:",
    data,
    "",
    "Respond with one minified JSON object matching this JSON schema exactly:",
    JSON.stringify(jsonSchema),
  ].join("\n");

  return {
    instructions: VEHICLE_VERDICT_INSTRUCTIONS,
    userPayload,
    jsonSchema,
  };
}
