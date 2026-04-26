const ACCESS_TOKEN_STORAGE_KEY = 'autocheck_access_token';

export function getAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function hasAccessToken(): boolean {
  return getAccessToken() != null;
}

export function consumeAccessTokenFromUrl(): string | null {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('token');

  if (!token) {
    return null;
  }

  setAccessToken(token);
  url.searchParams.delete('token');
  window.history.replaceState({}, document.title, url.toString());

  return token;
}
