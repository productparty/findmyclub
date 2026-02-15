/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            '@mui/material',
            '@emotion/react',
            '@emotion/styled',
            '@tanstack/react-query'
          ]
        }
      }
    },
    sourcemap: true
  },
  optimizeDeps: {
    include: ['@mui/material', '@emotion/react', '@emotion/styled', 'react-router-dom']
  },
  server: {
    host: true
  }
});
