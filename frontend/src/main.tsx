import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;

  // In production (Vercel), VITE_BACKEND_URL = "https://ohoofashion.onrender.com"
  // In development, it's empty so relative /api/ URLs hit the Vite dev proxy
  const API_BASE = import.meta.env.VITE_BACKEND_URL ?? '';

  if (typeof resource === 'string' && resource.startsWith('/api/')) {
    resource = API_BASE + resource;
  }
  return originalFetch(resource, config);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
