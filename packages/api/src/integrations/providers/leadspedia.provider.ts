export interface ProviderResult {
  success: boolean;
  statusCode: number | null;
  body: unknown;
}

export async function postLead(
  endpointUrl: string,
  authParams: Record<string, string>,
  fieldData: Record<string, unknown>,
): Promise<ProviderResult> {
  try {
    const payload = { ...authParams, ...fieldData };

    const res = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
