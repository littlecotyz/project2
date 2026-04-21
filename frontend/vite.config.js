import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      // Proxy websocket connections (e.g. channels/ws)
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true
      }
    }
  }
})
