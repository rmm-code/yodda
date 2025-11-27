import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Development server config
    host: true,
    port: 5173,
    allowedHosts: [
      'yodda.app',
      '.yodda.app',
      'localhost',
      '127.0.0.1',
    ],
  },
  preview: {
    // Allow preview server to be accessed from yodda.app
    host: true,
    allowedHosts: [
      'yodda.app',
      'www.yodda.app',
      '.yodda.app', // Allow all subdomains
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
    ],
  },
  build: {
    // Production build optimizations
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
