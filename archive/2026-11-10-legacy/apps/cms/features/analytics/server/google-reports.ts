import { type AnalyticsProviderRequest } from "@blog-platform/core/analytics";

import type {
  FetchLike,
  Ga4RunReportResponse,
  GscSearchAnalyticsResponse,
} from "../model/google-contracts";
export async function requestGoogleJson<T>(
  fetchImpl: FetchLike,
  url: string,
  token: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : {};
  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? JSON.stringify((payload as { error: unknown }).error)
        : text;
    throw new Error(`Google API request failed ${response.status}: ${message}`);
  }
  return payload as T;
}

export async function fetchGa4Report(input: {
  request: AnalyticsProviderRequest;
  propertyId: string;
  token: string;
  fetchImpl: FetchLike;
  previous?: boolean;
  dimensions?: string[];
}) {
  const range = input.request.dateRange;
  const startDate = input.previous ? range.previousStartDate : range.startDate;
  const endDate = input.previous ? range.previousEndDate : range.endDate;
  if (!startDate || !endDate) return { rows: [] } satisfies Ga4RunReportResponse;
  return requestGoogleJson<Ga4RunReportResponse>(
    input.fetchImpl,
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(
      input.propertyId,
    )}:runReport`,
    input.token,
    {
      dateRanges: [{ startDate, endDate }],
      dimensions: (input.dimensions ?? []).map((name) => ({ name })),
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      limit: "250",
    },
  );
}

export async function fetchGscReport(input: {
  request: AnalyticsProviderRequest;
  property: string;
  token: string;
  fetchImpl: FetchLike;
  previous?: boolean;
  dimensions?: string[];
}) {
  const range = input.request.dateRange;
  const startDate = input.previous ? range.previousStartDate : range.startDate;
  const endDate = input.previous ? range.previousEndDate : range.endDate;
  if (!startDate || !endDate) return { rows: [] } satisfies GscSearchAnalyticsResponse;
  return requestGoogleJson<GscSearchAnalyticsResponse>(
    input.fetchImpl,
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
      input.property,
    )}/searchAnalytics/query`,
    input.token,
    {
      startDate,
      endDate,
      dimensions: input.dimensions ?? [],
      rowLimit: 250,
    },
  );
}
