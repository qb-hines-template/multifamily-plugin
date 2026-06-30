const DEFAULT_EXTERNAL_API_TIMEOUT_MS = 15_000;

const getExternalApiTimeoutMs = () => {
  const configured = Number(process.env.EXTERNAL_API_TIMEOUT_MS);

  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_EXTERNAL_API_TIMEOUT_MS;
};

/**
 * `fetch` wrapper that aborts the request when it exceeds the configured timeout.
 * Override via `EXTERNAL_API_TIMEOUT_MS` (milliseconds).
 */
const fetchWithTimeout = async (
  input: string | URL,
  init?: RequestInit,
  timeoutMs = getExternalApiTimeoutMs(),
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export { DEFAULT_EXTERNAL_API_TIMEOUT_MS, fetchWithTimeout, getExternalApiTimeoutMs };
