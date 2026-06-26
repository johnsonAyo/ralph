import assert from "node:assert/strict";
import test from "node:test";
import { ConfigService } from "@nestjs/config";
import {
  AuctionPlatformCode,
  ExtractionConfidence,
  ReportResult,
  ReportVerdictCode,
} from "@ralph/shared";
import { AppError } from "@/common/errors/app.error";
import { OllamaRalphAnalyserService } from "@/modules/ai/infrastructure/ollama-ralph-analyser.service";

const listing = {
  platform: AuctionPlatformCode.CopartUk,
  listingUrl: "https://www.copart.co.uk/lot/49254916/example",
  title: "2014 VAUXHALL ASTRA 2.0 CDTI 16V SRI 5DR AUTO",
  year: 2014,
  make: "VAUXHALL",
  model: "ASTRA SRI",
  mileage: 96638,
  mileageUnit: "MI",
  currentBid: 1500,
  currency: "GBP",
  saleDate: "2026-06-15T09:00:00.000Z",
  location: "NEWBURY",
  primaryDamage: "FRONT END",
  secondaryDamage: "MINOR DENTS/SCRATCHES",
  hasKeys: true,
  estimatedRetailValue: 3258,
  images: [
    { fullUrl: "https://cdn.example.test/1.jpg", highResUrl: undefined as string | undefined },
  ],
  extractionConfidence: ExtractionConfidence.High,
  missingFields: [],
};

const request = {
  listingUrl: listing.listingUrl,
  totalUserBudget: 3500,
  postcode: "SW1A 1AA",
  riskTolerance: "cautious" as const,
  repairPlan: "unknown" as const,
};

function makeConfig(): ConfigService {
  return {
    get: (key: string) => {
      if (key === "OLLAMA_MODEL") return "llama3.2";
      return undefined;
    },
    getOrThrow: (key: string) => {
      if (key === "OLLAMA_URL") return "http://localhost:11434";
      throw new Error(`Unexpected config key: ${key}`);
    },
  } as unknown as ConfigService;
}

interface FetchCall {
  url: string;
  init: RequestInit;
}

function installFetchMock(handler: (call: FetchCall) => Promise<Response>): {
  calls: FetchCall[];
  restore: () => void;
} {
  const calls: FetchCall[] = [];
  const original = globalThis.fetch;

  globalThis.fetch = (async (input: any, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.url;
    calls.push({ url, init: init ?? {} });
    return handler({ url, init: init ?? {} });
  }) as typeof fetch;

  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

test("OllamaRalphAnalyserService posts the structured-output request to /api/chat and parses the response", async () => {
  const mock = installFetchMock(async ({ url, init }) => {
    if (url.includes("cdn.example.test")) {
      return new Response(Buffer.from("fake-image-bytes"), {
        status: 200,
        headers: { "Content-Type": "image/jpeg" },
      });
    }

    if (url === "http://localhost:11434/api/chat") {
      const body = JSON.parse((init.body as string) ?? "{}");
      assert.equal(body.stream, false);
      assert.equal(body.model, "llama3.2");
      assert.equal(body.messages[0].role, "system");
      assert.ok(body.messages[0].content.startsWith("You are Ralph"));
      assert.equal(body.messages[1].role, "user");
      assert.equal(body.messages[1].images.length, 1);
      assert.equal(body.format.type, "object");
      assert.ok(body.format.properties);

      const reportJson: ReportResult = {
        verdict: ReportVerdictCode.GoodCandidate,
        confidence: ExtractionConfidence.High,
        summary: "Local Ollama produced a verdict.",
        keyRisks: ["Possible front-end work."],
        assumptions: ["Fees assumed within Copart UK range."],
        recommendedNextStep: "Bid only with repair allowance intact.",
      };

      return new Response(
        JSON.stringify({ message: { content: JSON.stringify(reportJson) } }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response("not found", { status: 404 });
  });

  try {
    const service = new OllamaRalphAnalyserService(makeConfig());
    const result = await service.analyse({ request, listing } as any);

    assert.equal(result.verdict, ReportVerdictCode.GoodCandidate);
    assert.equal(result.summary, "Local Ollama produced a verdict.");

    const chatCall = mock.calls.find((c) => c.url === "http://localhost:11434/api/chat");
    assert.ok(chatCall, "expected an /api/chat fetch call");
    assert.equal(chatCall!.init.method, "POST");
    assert.equal(
      (chatCall!.init.headers as Record<string, string>)["Content-Type"],
      "application/json",
    );
  } finally {
    mock.restore();
  }
});

test("OllamaRalphAnalyserService throws OLLAMA_ANALYSIS_FAILED on non-2xx responses", async () => {
  const mock = installFetchMock(async () => {
    return new Response("model missing", { status: 404 });
  });

  try {
    const service = new OllamaRalphAnalyserService(makeConfig());
    await assert.rejects(
      () => service.analyse({ request, listing } as any),
      (err: unknown) => {
        assert.ok(err instanceof AppError);
        assert.equal((err as AppError).code, "OLLAMA_ANALYSIS_FAILED");
        return true;
      },
    );
  } finally {
    mock.restore();
  }
});

test("OllamaRalphAnalyserService throws OLLAMA_ANALYSIS_TIMEOUT on AbortError", async () => {
  const mock = installFetchMock(async () => {
    const err = new Error("aborted");
    err.name = "AbortError";
    throw err;
  });

  try {
    const service = new OllamaRalphAnalyserService(makeConfig());
    await assert.rejects(
      () => service.analyse({ request, listing } as any),
      (err: unknown) => {
        assert.ok(err instanceof AppError);
        assert.equal((err as AppError).code, "OLLAMA_ANALYSIS_TIMEOUT");
        return true;
      },
    );
  } finally {
    mock.restore();
  }
});
