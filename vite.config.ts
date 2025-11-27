import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'yodda.app',
      'www.yodda.app',
      'localhost',
      '127.0.0.1',
    ],
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: [
      'yodda.app',
      'www.yodda.app'
    ],
  },
})
