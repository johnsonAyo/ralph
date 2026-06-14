"use client";

import React, { useState } from "react";
import { listingSnapshotSchema, ListingSnapshot } from "@auction-risk/shared";
import { API_BASE_URL } from "../constants";

export default function ExtractDemoPage() {
  const [listingUrl, setListingUrl] = useState("");
  const [result, setResult] = useState<ListingSnapshot | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/extraction/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ listingUrl })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "Extraction failed.");
      }

      const parsed = listingSnapshotSchema.safeParse(payload);

      if (!parsed.success) {
        throw new Error("The API returned an unexpected extraction payload.");
      }

      setResult(parsed.data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Extraction failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 960, margin: "40px auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1>Extraction demo</h1>
      <p>Paste a Copart or IAA/SYNETIQ listing link and submit.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label htmlFor="listingUrl">Listing URL</label>
        <textarea
          id="listingUrl"
          value={listingUrl}
          onChange={(event) => setListingUrl(event.target.value)}
          rows={4}
          placeholder="https://www.copart.co.uk/lot/..."
          required
          style={{ padding: 12, font: "inherit" }}
        />
        <button type="submit" disabled={isLoading} style={{ padding: 12, font: "inherit" }}>
          {isLoading ? "Extracting..." : "Extract listing"}
        </button>
      </form>

      {error ? (
        <pre style={{ marginTop: 24, color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>
      ) : null}

      {result ? (
        <section style={{ marginTop: 32 }}>
          <h2>Extracted summary</h2>
          <dl style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 8 }}>
            <dt>Platform</dt>
            <dd>{result.platform}</dd>
            <dt>Confidence</dt>
            <dd>{result.extractionConfidence}</dd>
            <dt>Missing fields</dt>
            <dd>{result.missingFields?.length ? result.missingFields.join(", ") : "None"}</dd>
            <dt>Lot number</dt>
            <dd>{result.lotNumber}</dd>
            <dt>Title</dt>
            <dd>{result.title}</dd>
            <dt>Current bid</dt>
            <dd>{formatMoney(result.currentBid, result.currency)}</dd>
            <dt>Images</dt>
            <dd>{result.images?.length ?? 0}</dd>
          </dl>

          {result.images?.length ? (
            <>
              <h2>Images</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
                {result.images.slice(0, 12).map((image) => (
                  <img
                    key={image.fullUrl}
                    src={image.thumbnailUrl ?? image.fullUrl}
                    alt=""
                    style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }}
                  />
                ))}
              </div>
            </>
          ) : null}

          <h2>Raw JSON</h2>
          <pre style={{ overflow: "auto", padding: 16, background: "#f4f4f4" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      ) : null}
    </main>
  );
}

function formatMoney(value: unknown, currency = "GBP") {
  if (typeof value !== "number") {
    return "N/A";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency
  }).format(value);
}
