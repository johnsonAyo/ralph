import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { VehicleDataProvider, VehicleProfilePatch } from "../domain/vehicle-data-provider.interface";

@Injectable()
export class DvlaVesProvider implements VehicleDataProvider {
  readonly name = "dvla_ves";
  private readonly logger = new Logger(DvlaVesProvider.name);
  private readonly apiKey: string | undefined;
  private readonly endpoint: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>("DVLA_VES_API_KEY");
    this.endpoint =
      config.get<string>("DVLA_VES_URL") ??
      "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async fetch(registration: string): Promise<VehicleProfilePatch | null> {
    if (!this.apiKey) {
      throw new Error("DVLA_VES_API_KEY is not set.");
    }
    const reg = registration.replace(/\s+/g, "").toUpperCase();
    let response: Response;
    try {
      response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationNumber: reg }),
        signal: AbortSignal.timeout(15000),
      });
    } catch (error) {
      this.logger.warn(`[dvla_ves] request failed: ${(error as Error).message}`);
      return null;
    }

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      this.logger.warn(`[dvla_ves] ${response.status} for ${reg}`);
      return null;
    }

    const d = (await response.json()) as Record<string, unknown>;
    const num = (v: unknown): number | undefined => {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };
    const str = (v: unknown): string | undefined =>
      typeof v === "string" && v.trim() ? v.trim() : undefined;

    return {
      identity: {
        make: str(d.make),
        colour: str(d.colour),
        fuelType: str(d.fuelType),
        yearOfManufacture: num(d.yearOfManufacture),
        engineCapacityCc: num(d.engineCapacity),
        typeApproval: str(d.typeApproval),
        wheelplan: str(d.wheelplan),
      },
      emissions: {
        co2gPerKm: num(d.co2Emissions),
        euroStatus: str(d.euroStatus),
      },
      status: {
        taxStatus: str(d.taxStatus),
        taxDueDate: str(d.taxDueDate),
        motStatus: str(d.motStatus),
        motExpiryDate: str(d.motExpiryDate),
        dateFirstRegistered: str(d.monthOfFirstRegistration),
        dateOfLastV5cIssued: str(d.dateOfLastV5CIssued),
        markedForExport:
          typeof d.markedForExport === "boolean" ? d.markedForExport : undefined,
      },
    };
  }
}
