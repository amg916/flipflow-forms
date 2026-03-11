const HUBSPOT_API_BASE = 'https://api.hubapi.com';

export interface ProviderResult {
  success: boolean;
  statusCode: number | null;
  body: unknown;
}

export async function testConnection(accessToken: string): Promise<ProviderResult> {
  try {
    const res = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts?limit=1`, {
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

export async function createContact(
  accessToken: string,
  fieldData: Record<string, unknown>,
): Promise<ProviderResult> {
  try {
    const res = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties: fieldData }),
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
