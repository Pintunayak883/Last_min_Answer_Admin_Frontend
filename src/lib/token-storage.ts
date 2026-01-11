const TOKEN_KEY = "lma_admin_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  // Prefer cookie when available
  const tokenFromCookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${TOKEN_KEY}=`));

  if (tokenFromCookie) {
    return decodeURIComponent(tokenFromCookie.split("=")[1]);
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function persistToken(token: string) {
  if (typeof window === "undefined") return;
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(
    token
  )}; path=/; samesite=lax`;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  document.cookie = `${TOKEN_KEY}=; Max-Age=0; path=/; samesite=lax`;
  localStorage.removeItem(TOKEN_KEY);
}
