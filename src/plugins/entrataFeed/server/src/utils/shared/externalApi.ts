import { fetchWithTimeout } from '../../shared/fetchWithTimeout';

const externalApi = async (
  methodName,
  params,
  Entrata_URL,
  Api_Key,
  version
) => {
  try {
    const response = await fetchWithTimeout(Entrata_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": Api_Key,
      },
      body: JSON.stringify({
        auth: { type: "apikey" },
        requestId: "15",
        method: {
          name: methodName,
          version,
          params,
        },
      }),
    });

    if (!response.ok) {
      let details = "";

      try {
        const errorBody = await response.json();
        details =
          (errorBody as { response?: { error?: { message?: string } } }).response
            ?.error?.message ||
          (errorBody as { error?: { message?: string } }).error?.message ||
          (errorBody as { response?: { message?: string } }).response?.message ||
          "";
      } catch {
        // Response body is not JSON.
      }

      throw new Error(
        `Entrata API failed: ${response.status} ${response.statusText}${
          details ? ` - ${details}` : ""
        }`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error calling ${methodName}:`, error);
    throw error;
  }
};

export default externalApi;
