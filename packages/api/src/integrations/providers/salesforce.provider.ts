export interface ProviderResult {
  success: boolean;
  statusCode: number | null;
  body: unknown;
}

export async function testConnection(
  instanceUrl: string,
  accessToken: string,
): Promise<ProviderResult> {
  try {
    const baseUrl = instanceUrl.replace(/\/+$/, '');
    const res = await fetch(`${baseUrl}/services/data/v59.0/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const body = await res.json().catch(() => null);

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

export async function createLead(
  instanceUrl: string,
  accessToken: string,
  fieldData: Record<string, unknown>,
): Promise<ProviderResult> {
  try {
    const baseUrl = instanceUrl.replace(/\/+$/, '');
    const res = await fetch(`${baseUrl}/services/data/v59.0/sobjects/Lead`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fieldData),
    });

    const body = await res.json().catch(() => null);

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
