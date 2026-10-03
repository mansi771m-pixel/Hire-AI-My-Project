export const getApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || import.meta.env.APP_URL || "").replace(/\/$/, "");

  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
};

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return normalizedPath;
  }

  return `${baseUrl}${normalizedPath}`;
};

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  return fetch(buildApiUrl(path), options);
};
