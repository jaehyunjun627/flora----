import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

<<<<<<< HEAD
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
=======
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
>>>>>>> 1c64f327d1e86abb7ebac9eb4417280e53926492
})
