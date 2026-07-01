import { VehicleVerdict } from "@ralph/shared";
import { VehicleVerdictContext } from "./vehicle-verdict-context";

export interface VehicleVerdictAnalyserPort {
  analyse(input: VehicleVerdictContext): Promise<VehicleVerdict>;
}
