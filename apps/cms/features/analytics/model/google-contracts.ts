export type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type GoogleAnalyticsProviderConfig = {
  ga4PropertyId?: string;
  searchConsoleProperty?: string;
  serviceAccountJson?: string;
  serviceAccountKeyFile?: string;
  mockMode?: boolean;
  fetchImpl?: FetchLike;
};

export type GoogleServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

export type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

export type Ga4RunReportResponse = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
};

export type GscSearchAnalyticsResponse = {
  rows?: Array<{
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  }>;
};
