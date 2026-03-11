export interface ProviderResult {
  success: boolean;
  statusCode: number | null;
  body: unknown;
}

export async function postConversion(
  endpointUrl: string,
  trackingParams: Record<string, unknown>,
): Promise<ProviderResult> {
  try {
    const res = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingParams),
    });

    const body = await res.json().catch(() => res.text());

    return {
      success: res.ok,
      statusCode: res.status,
      body,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: null,
      body: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}
