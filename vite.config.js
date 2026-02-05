import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/jupas/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://121.40.28.153:8080',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})

