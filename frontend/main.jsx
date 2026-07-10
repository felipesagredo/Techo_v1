// Interceptor global de fetch para redireccionar localhost:5000 al servidor correspondiente
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  let url = typeof input === 'string' ? input : (input && input.url);
  if (typeof url === 'string' && url.startsWith('http://localhost:5000')) {
    const { hostname, protocol } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const apiBase = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:5000' : `${protocol}//${hostname}`);
    const newUrl = url.replace('http://localhost:5000', apiBase);
    
    if (typeof input === 'string') {
      input = newUrl;
    } else {
      input = new Request(newUrl, input);
    }
  }
  return originalFetch.call(this, input, init);
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
