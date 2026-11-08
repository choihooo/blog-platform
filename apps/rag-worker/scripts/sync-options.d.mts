export type SyncOptions = {
  endpoint: string;
  execute: boolean;
  requestsPerMinute: number;
  offset: number;
  revision?: string;
};
export function parseSyncOptions(argv: string[]): SyncOptions;
export function runSync(
  options: SyncOptions,
  token: string,
  deps?: {
    fetcher?: typeof fetch;
    sleep?: (ms: number) => Promise<void>;
    report?: (result: Record<string, unknown>) => void;
  },
): Promise<{ total: number; revision: string; nextOffset: number | null }>;
