import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Split heavy dependencies to reduce main-thread parse pressure.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          icons: ['@fortawesome/fontawesome-free/css/all.min.css'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
