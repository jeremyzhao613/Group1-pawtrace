import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  const apiTarget = env.VITE_API_BASE_URL || env.PAWTRACE_API_BASE_URL || 'http://localhost:3000';
  const apiProxy = {
    target: apiTarget,
    changeOrigin: true,
  };

  return {
    envPrefix: ['VITE_', 'PAWTRACE_'],
    server: {
      port: 3001,
      host: '0.0.0.0',
      allowedHosts: true,
      proxy: {
        '/api': apiProxy,
        '/assets': apiProxy,
      },
    },
    preview: {
      port: 3001,
      host: '0.0.0.0',
      allowedHosts: true,
      proxy: {
        '/api': apiProxy,
        '/assets': apiProxy,
      },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
