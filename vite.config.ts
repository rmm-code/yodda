import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['tender-papers-rush.loca.lt', 'sweet-poems-sing.loca.lt', 'https://proud-turkeys-clean.loca.lt'],
  },
})
