import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/jupas/',
  server: {
    port: 3000,
    proxy: {
      '/jupas-backend': {
        target: 'http://112.124.68.82',
        changeOrigin: true
      }
    }
  }
})

