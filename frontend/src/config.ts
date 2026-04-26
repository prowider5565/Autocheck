const DEFAULT_BACKEND_URL = 'http://localhost:3000';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

const backendBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_BACKEND_URL?.trim() || DEFAULT_BACKEND_URL,
);

export const appConfig = {
  backendBaseUrl,
};

export function buildBackendUrl(path: string): string {
  if (!path.startsWith('/')) {
    return `${backendBaseUrl}/${path}`;
  }

  return `${backendBaseUrl}${path}`;
}
