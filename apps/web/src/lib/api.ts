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
