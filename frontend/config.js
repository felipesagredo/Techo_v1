const getApiUrl = () => {
  if (import.meta.env.VITE_BASE_URL) {
    return import.meta.env.VITE_BASE_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const { hostname, protocol } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  return `${protocol}//${hostname}/api`;
};

export const API_URL = getApiUrl();
export const API_BASE = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
