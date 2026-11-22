let cachedToken: string | null = null;

export async function getAuthToken(forceRefresh = false): Promise<string | null> {
  if (cachedToken && !forceRefresh) return cachedToken;

  try {
    const res = await fetch("/api/auth/token", { credentials: "include" });
    if (!res.ok) {
      cachedToken = null;
      return null;
    }
    const data = await res.json();
    cachedToken = data?.token || null;
    return cachedToken;
  } catch {
    return null;
  }
}

export function clearAuthToken() {
  cachedToken = null;
}

export async function authFetch(url: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}