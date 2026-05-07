import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/img': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
