import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/weather': 'http://localhost:8787',
      '/decision-ai': 'http://localhost:8787',
      '/ai-insights': 'http://localhost:8787',
      '/compare-cities': 'http://localhost:8787',
      '/packing': 'http://localhost:8787',
      '/health': 'http://localhost:8787',
      '/trend-analysis': 'http://localhost:8787',
      '/micro-forecast': 'http://localhost:8787',
      '/city-suggestions': 'http://localhost:8787',
      '/reverse-geocode': 'http://localhost:8787',
    },
  },
})
