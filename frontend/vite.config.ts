import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isDev = mode === 'development';

  return {
    base: "/",   // ⭐ VERY IMPORTANT FOR VERCEL

    plugins: [react(), tailwindcss()],

    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',

      proxy: isDev
        ? {
            '/api': 'http://localhost:5001',
          }
        : {
            '/api': {
              target: process.env.VITE_BACKEND_URL || 'https://ohoofashion-backend.up.railway.app',
              changeOrigin: true,
              secure: true,
            },
          },
          }
        : undefined,
    },

    build: {
      outDir: "dist"
    }
  };
});