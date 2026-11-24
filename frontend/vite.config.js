import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 4000,
    strictPort: true,
    // Lie explicitement sur 0.0.0.0 : sans ca, sur certaines machines Windows
    // Vite n'ecoute que sur ::1 (IPv6) et un client/script qui teste
    // 127.0.0.1 (IPv4) recoit "connexion refusee" alors que le serveur tourne.
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
