import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    proxy: {
      '/jupas-backend': {
        target: 'http://121.40.28.153',
        changeOrigin: true
      }
    }
  }
})

