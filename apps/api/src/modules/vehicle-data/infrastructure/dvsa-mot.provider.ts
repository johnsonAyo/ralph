import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MotTest } from "@ralph/shared";
import { VehicleDataProvider, VehicleProfilePatch } from "../domain/vehicle-data-provider.interface";

@Injectable()
export class DvsaMotProvider implements VehicleDataProvider {
  readonly name = "dvsa_mot";
  private readonly logger = new Logger(DvsaMotProvider.name);

  private readonly clientId: string | undefined;
  private readonly clientSecret: string | undefined;
  private readonly apiKey: string | undefined;
  private readonly tokenUrl: string | undefined;
  private readonly scope: string;
  private readonly baseUrl: string;

  private cachedToken: { value: string; expiresAt: number } | null = null;

  constructor(config: ConfigService) {
    this.clientId = config.get<string>("DVSA_MOT_CLIENT_ID");
    this.clientSecret = config.get<string>("DVSA_MOT_CLIENT_SECRET");
    this.apiKey = config.get<string>("DVSA_MOT_API_KEY");
    this.tokenUrl = config.get<string>("DVSA_MOT_TOKEN_URL");
    this.scope =
      config.get<string>("DVSA_MOT_SCOPE") ?? "https://tapi.dvsa.gov.uk/.default";
    this.baseUrl =
      config.get<string>("DVSA_MOT_URL") ??
      "https://history.mot.api.gov.uk/v1/trade/vehicles/registration";
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret && this.apiKey && this.tokenUrl);
  }

  private async getToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now + 30_000) {
      return this.cachedToken.value;
    }
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.clientId as string,
      client_secret: this.clientSecret as string,
      scope: this.scope,
    });
    const res = await fetch(this.tokenUrl as string, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      throw new Error(`DVSA token request failed: ${res.status}`);
    }
    const json = (await res.json()) as { access_token: string; expires_in?: number };
    const ttlMs = (json.expires_in ?? 3600) * 1000;
    this.cachedToken = { value: json.access_token, expiresAt: now + ttlMs };
    return json.access_token;
  }

  async fetch(registration: string): Promise<VehicleProfilePatch | null> {
    if (!this.isConfigured()) {
      throw new Error("DVSA MOT credentials are not fully set.");
    }
    const reg = registration.replace(/\s+/g, "").toUpperCase();

    let token: string;
    try {
      token = await this.getToken();
    } catch (error) {
      this.logger.warn(`[dvsa_mot] token error: ${(error as Error).message}`);
      return null;
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/${encodeURIComponent(reg)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-Key": this.apiKey as string,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(15000),
      });
    } catch (error) {
      this.logger.warn(`[dvsa_mot] request failed: ${(error as Error).message}`);
      return null;
    }

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      this.logger.warn(`[dvsa_mot] ${response.status} for ${reg}`);
      return null;
    }

    const payload = (await response.json()) as unknown;
    const v = (Array.isArray(payload) ? payload[0] : payload) as
      | Record<string, unknown>
      | undefined;
    if (!v) {
      return null;
    }

    const str = (x: unknown): string | undefined =>
      typeof x === "string" && x.trim() ? x.trim() : undefined;

    const rawTests = Array.isArray(v.motTests) ? (v.motTests as Record<string, unknown>[]) : [];
    const motHistory: MotTest[] = rawTests.map((t) => {
      const odo = Number(t.odometerValue);
      const defects = Array.isArray(t.defects) ? (t.defects as Record<string, unknown>[]) : [];
      return {
        completedDate: str(t.completedDate),
        testResult: str(t.testResult),
        expiryDate: str(t.expiryDate),
        odometerValue: Number.isFinite(odo) ? odo : undefined,
        odometerUnit: str(t.odometerUnit),
        odometerResultType: str(t.odometerResultType),
        motTestNumber: str(t.motTestNumber),
        defects: defects.map((d) => ({
          text: str(d.text) ?? "",
          type: normaliseDefectType(str(d.type)),
          dangerous: typeof d.dangerous === "boolean" ? d.dangerous : undefined,
        })),
      };
    });

    return {
      identity: {
        make: str(v.make),
        model: str(v.model),
        fuelType: str(v.fuelType),
        colour: str(v.primaryColour),
      },
      status: {
        dateFirstRegistered: str(v.firstUsedDate) ?? str(v.registrationDate),
      },
      motHistory,
    };
  }
}

function normaliseDefectType(
  raw: string | undefined,
):
  | "ADVISORY"
  | "MINOR"
  | "MAJOR"
  | "DANGEROUS"
  | "FAIL"
  | "USER_ENTERED"
  | undefined {
  if (!raw) return undefined;
  const v = raw.toUpperCase().replace(/\s+/g, "_");
  const allowed = ["ADVISORY", "MINOR", "MAJOR", "DANGEROUS", "FAIL", "USER_ENTERED"];
  return (allowed.includes(v) ? v : undefined) as never;
}
