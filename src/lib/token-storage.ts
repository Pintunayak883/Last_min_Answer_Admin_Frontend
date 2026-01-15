const TOKEN_KEY = "one_answers_admin_token";
const LEGACY_TOKEN_KEY = "lma_admin_token";

function readCookieValue(key: string): string | null {
  const part = document.cookie
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${key}=`));

  if (!part) return null;
  return decodeURIComponent(part.split("=")[1]);
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  // Prefer cookie when available
  return (
    readCookieValue(TOKEN_KEY) ||
    readCookieValue(LEGACY_TOKEN_KEY) ||
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(LEGACY_TOKEN_KEY)
  );
}

export function persistToken(token: string) {
  if (typeof window === "undefined") return;
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(
    token
  )}; path=/; samesite=lax`;
  // Keep legacy cookie for a smoother transition
  document.cookie = `${LEGACY_TOKEN_KEY}=${encodeURIComponent(
    token
  )}; path=/; samesite=lax`;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  document.cookie = `${TOKEN_KEY}=; Max-Age=0; path=/; samesite=lax`;
  document.cookie = `${LEGACY_TOKEN_KEY}=; Max-Age=0; path=/; samesite=lax`;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}
