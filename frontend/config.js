const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const { hostname, protocol } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  return `${protocol}//${hostname}`;
};

export const API_BASE = getApiBaseUrl();
export const API_URL = `${API_BASE}/api`;
