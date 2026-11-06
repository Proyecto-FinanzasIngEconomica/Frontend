import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        // Preserve the browser's Host so Spring sees the proxied request as same-origin.
        '/api': { target: env.API_PROXY_TARGET || 'http://127.0.0.1:8080' },
      },
    },
  };
});
