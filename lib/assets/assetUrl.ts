const DEFAULT_API_BASE_URL = 'http://localhost:8080/api';

const normalizeBackendBaseUrl = (apiBaseUrl?: string): string => {
  const resolvedApiBaseUrl = apiBaseUrl || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
  return resolvedApiBaseUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
};

export const resolveAssetUrl = (assetPath?: string | null, apiBaseUrl?: string): string | null => {
  if (!assetPath) return null;
  const normalizedAssetPath = assetPath.trim().replace(/\\/g, '/');
  if (!normalizedAssetPath) return null;
  if (normalizedAssetPath.startsWith('http://') || normalizedAssetPath.startsWith('https://')) {
    return normalizedAssetPath;
  }

  const backendBaseUrl = normalizeBackendBaseUrl(apiBaseUrl);
  const normalizedPath = normalizedAssetPath.startsWith('/') ? normalizedAssetPath : `/${normalizedAssetPath}`;
  return `${backendBaseUrl}${normalizedPath}`;
};
