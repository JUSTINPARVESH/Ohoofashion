import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  // Provide the Render backend URL as the API base for production
  const API_BASE = import.meta.env.VITE_BACKEND_URL || (import.meta.env.MODE === 'development' ? '' : 'https://ohoofashion.onrender.com');
  
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
