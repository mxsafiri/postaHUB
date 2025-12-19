export type ApiError = {
  status: number;
  code: string;
};

const defaultBaseUrl =
  (process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined) ??
  "http://localhost:3002";

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { baseUrl?: string },
): Promise<T> {
  const baseUrl = init?.baseUrl ?? defaultBaseUrl;
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const body = (await parseJsonSafe(res)) as any;
    const code = body?.message || body?.error || "api_error";
    throw { status: res.status, code } satisfies ApiError;
  }

  return (await res.json()) as T;
}

export type MeResponse = {
  account: {
    id: string;
    phoneE164: string;
    displayName: string | null;
    nidaNumber?: string | null;
    nidaVerificationStatus?: 'not_provided' | 'pending' | 'verified' | 'failed' | string;
    status: string;
  };
  roles: string[];
};

export async function apiMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/v1/auth/me", { method: "GET" });
}

export async function apiLogin(input: {
  phone: string;
  password: string;
}): Promise<MeResponse> {
  return apiFetch<MeResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function apiRegister(input: {
  phone: string;
  password: string;
  displayName?: string;
  nidaNumber?: string;
}): Promise<MeResponse> {
  return apiFetch<MeResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function apiLogout(): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>("/v1/auth/logout", {
    method: "POST",
  });
}

export type AdminPartner = {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AdminPartnerApiKey = {
  id: string;
  partner_id: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export async function apiAdminListPartners(): Promise<{ partners: AdminPartner[] }> {
  return apiFetch<{ partners: AdminPartner[] }>("/v1/admin/partners", { method: "GET" });
}

export async function apiAdminCreatePartner(input: { name: string }): Promise<AdminPartner> {
  return apiFetch<AdminPartner>("/v1/admin/partners", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function apiAdminListPartnerKeys(partnerId: string): Promise<{ keys: AdminPartnerApiKey[] }> {
  return apiFetch<{ keys: AdminPartnerApiKey[] }>(`/v1/admin/partners/${partnerId}/api-keys`, { method: "GET" });
}

export async function apiAdminCreatePartnerKey(partnerId: string): Promise<{ apiKey: string; key: AdminPartnerApiKey }> {
  return apiFetch<{ apiKey: string; key: AdminPartnerApiKey }>(`/v1/admin/partners/${partnerId}/api-keys`, {
    method: "POST",
  });
}

export async function apiAdminRevokePartnerKey(keyId: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(`/v1/admin/partners/api-keys/${keyId}/revoke`, {
    method: "POST",
  });
}

export type AdminOverviewResponse = {
  health: {
    db: 'ok' | 'error' | string;
  };
  counts: {
    accounts: number;
    partners: number;
    apiKeysActive: number;
    apiKeysRevoked: number;
    auditLogs24h: number;
  };
};

export async function apiAdminOverview(): Promise<AdminOverviewResponse> {
  return apiFetch<AdminOverviewResponse>("/v1/admin/overview", { method: "GET" });
}

export type AdminAccountSummary = {
  id: string;
  phone_e164: string;
  display_name: string | null;
  nida_number: string | null;
  nida_verification_status: string;
  status: string;
  created_at: string;
  updated_at: string;
  roles: string[];
};

export async function apiAdminSearchAccounts(input: {
  q?: string;
  limit?: number;
}): Promise<{ accounts: AdminAccountSummary[] }> {
  const qs = new URLSearchParams();
  if (typeof input.q === 'string') qs.set('q', input.q);
  if (typeof input.limit === 'number') qs.set('limit', String(input.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<{ accounts: AdminAccountSummary[] }>(`/v1/admin/accounts${suffix}`, { method: 'GET' });
}

export async function apiAdminAccountAddRole(accountId: string, role: string): Promise<{ ok: true; roles: string[] }> {
  return apiFetch<{ ok: true; roles: string[] }>(`/v1/admin/accounts/${accountId}/roles/add`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export async function apiAdminAccountRemoveRole(
  accountId: string,
  role: string,
): Promise<{ ok: true; roles: string[] }> {
  return apiFetch<{ ok: true; roles: string[] }>(`/v1/admin/accounts/${accountId}/roles/remove`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}
