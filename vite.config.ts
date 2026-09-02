import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'path';
import { mockApiPlugin } from './mock';

// https://vite.dev/config/
export default defineConfig({
  // Attivo solo con `--mode mock`; altrove è un no-op.
  plugins: [mockApiPlugin(), TanStackRouterVite(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
