import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.DEV_HOST || '127.0.0.1',
    port: Number(process.env.DEV_PORT || 5173),
    strictPort: true,
    allowedHosts: ['terminal.local'],
    proxy: { '/api': `http://127.0.0.1:${process.env.PORT || 3001}` },
  },
  build: { outDir: 'dist' },
});
