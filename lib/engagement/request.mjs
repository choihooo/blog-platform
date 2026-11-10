class ApiError extends Error {}

export async function requestJson(url, body, signal, { fetcher = fetch, timeoutMs = 15_000 } = {}) {
  const timeout = AbortSignal.timeout(timeoutMs);
  try {
    const response = await fetcher(url, {
      method: body ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store',
      ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    const result = await response.json();
    if (!response.ok) throw new ApiError(result.error ?? '요청을 처리하지 못했어요. 다시 시도해 주세요.');
    return result;
  } catch (error) {
    if (signal?.aborted || error instanceof ApiError) throw error;
    throw new Error('연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.');
  }
}
